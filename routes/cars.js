import express from 'express'
import { getCars, createCar, getCar, updateCar, deleteCar } from '../controllers/cars.js'
import { validateToken } from '../middleware/validateToken.js'
import { upload } from '../upload.js' 

const router = express.Router()

router.use(validateToken)

router.post('/', upload.single("file"), createCar);

router.put('/:id', upload.single("file"), updateCar);

router.get('/', getCars);

// router.post('/', createCar);

router.get('/:id', getCar);

router.delete('/:id', deleteCar);

// router.put('/:id', updateCar);


// router.route('/',upload.single("file")).post(createCar)

// router.route('/:id').get(getCar)

// router.route('/:id',upload.single("file")).put(updateCar)

// router.route('/:id').delete(deleteCar)

// router.route('/').get(getCars).post(createCar)
// router.route('/:id').get(getCar).put(updateCar).delete(deleteCar)

export default router



