document.addEventListener("DOMContentLoaded", () => {
  const carForm = document.getElementById("car-form");
  const carsList = document.getElementById("carsList");
  const URL = "http://localhost:5001/api/cars";

  // Fetch and display cars
  const token = localStorage.getItem("jwtToken");
  const user_Id = localStorage.getItem("userId");

  const fetchCars = async () => {
    try {
      const response = await fetch(URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const cars = await response.json();

      let output = "";
      cars.forEach(({ _id, carname, price, model, year, make, base64 }) => {
        const imageSrc = base64
          ? `data:image/jpg;base64,${base64}`
          : "path/to/default/image.jpg"; // Fallback for missing base64

        output += `
                    <tr>
                        <td><img src="${imageSrc}" style="width:100px;height:auto;"></td>
                        <td>${carname}</td>
                        <td>${price}</td>
                        <td>${model}</td>
                        <td>${year}</td>
                        <td>${make}</td>
                        <td>
                            <button onclick="editCar('${_id}')" class="btn btn-warning btn-sm">Edit</button>
                            <button onclick="deleteCar('${_id}')" class="btn btn-danger btn-sm">Delete</button>
                        </td>
                    </tr>
                `;
      });
      carsList.innerHTML = `<table class="table table-striped table-dark">
                                    <thead>
                                        <tr>                                            
                                            <th>Image</th>
                                            <th>Car</th>
                                            <th>Price</th>
                                            <th>Model</th>
                                            <th>Year</th>
                                            <th>Make</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>${output}</tbody>
                                   </table>`;
    } catch (error) {
      console.error("Error fetching cars:", error);
    }
  };

  // Submit form (Add or Update)
  const submitCarForm = async (e) => {
    e.preventDefault();

    let id = document.getElementById("carId").value;

    let formData = new FormData(carForm);

    let method = id ? "PUT" : "POST";
    let apiUrl = id ? `${URL}/${id}` : URL;

    try {
      const response = await fetch(apiUrl, {
        method: method,
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      carForm.reset();
      document.getElementById("carId").value = ""; // Reset hidden ID field
      await fetchCars();
    } catch (error) {
      console.error("Error submitting car form:", error);
    }
  };

  // Edit car
  window.editCar = async (carId) => {
    try {
      const response = await fetch(`${URL}/${carId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the JWT in the Authorization header
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const car = await response.json();

      console.log(car.filename);

      document.getElementById("carId").value = car._id;
      document.getElementById("carname").value = car.carname;
      document.getElementById("price").value = car.price;
      document.getElementById("model").value = car.model;
      document.getElementById("year").value = car.year;
      document.getElementById("make").value = car.make;
      // document.getElementById('carFile').value = car.filename

      carForm.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error("Error fetching car for edit:", error);
    }
  };

  window.deleteCar = async (id) => {
    await fetch(`${URL}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`, // Include the JWT in the Authorization header
      },
    });
    fetchCars();
  };

  carForm.addEventListener("submit", submitCarForm);

  fetchCars();
});
