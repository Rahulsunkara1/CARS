import asyncHandler from "express-async-handler";
import Car from "../models/car.js";

export const getCars = asyncHandler(async (req, res) => {
  try {
    const cars = await Car.find({ user_id: req.user.id }); // Fetch all cars

    const formattedCars = cars.map((car) => {
      return {
        ...car.toObject(), // Convert the MongoDB document to a plain JavaScript object
        base64: car.base64 ? car.base64.toString("base64") : null, // Convert Buffer to base64 string
      };
    });

    res.json(formattedCars); // Send formatted cars array as JSON response
  } catch (error) {
    res.status(500).send("Error retrieving cars.");
  }
});

export const createCar = asyncHandler(async (req, res) => {
  const { carname, price, model,year, make } = req.body;
  const file = req.file;

  // Assuming 'req.user.id' holds the authenticated user's ID
  const userId = req.user.id; // Make sure this is correctly populated

  if (!userId) {
    return res.status(400).send("User ID is required.");
  }

  if (!file) {
    return res.status(400).send("File is required.");
  }

  try {
    const base64Image = file.buffer.toString("base64");

    const car = new Car({
      user_id: userId,
      carname,
      price,
      model,
      year,
      make,
      filename: file.originalname,
      base64: base64Image,
    });

    await car.save();
    res.status(201).json({
      message: "Car added successfully",
      car: {
        id: car._id,
        carname: car.carname,
        price: car.price,
        model: car.model,
        year: car.year,
        make: car.make,
        filename: car.filename,
      },
    });
  } catch (error) {
    console.error("Failed to save car:", error);
    res.status(500).send("Server error");
  }
});

export const getCar = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id);
  if (!car) {
    res.status(400);
    throw new Error("Car not found");
  }
  res.status(200).json(car);
});

export const updateCar = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id);
  if (!car) {
    res.status(400);
    throw new Error("Car not found");
  }

  if (car.user_id.toString() !== req.user.id) {
    res.status(403);
    throw new Error(
      "User does not have permission to update another User's Car"
    );
  }

  const file = req.file;
  if (file) {
    car.base64 = file.buffer.toString("base64");
    car.filename = file.originalname;
  }
  car.carname = req.body.carname || car.carname;
  car.price = req.body.price || car.price;
  car.model = req.body.model || car.model;
  car.year = req.body.year || car.year;
  car.make = req.body.make || car.make;
  const updatedCar = await car.save();

  res.status(200).json(updatedCar);
});

export const deleteCar = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id);
  if (!car) {
    res.status(400);
    throw new Error("Car not found");
  }

  if (car.user_id.toString() !== req.user.id) {
    res.status(403);
    throw new Error(
      "User does not have permission to delete another User's Car"
    );
  }

  await Car.deleteOne({ _id: req.params.id });
  res.status(200).json(car);
});
