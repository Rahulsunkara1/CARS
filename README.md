e sameThis is a simple RESTful API on CARS

Front-end improvements
----------------------
I updated the front-end files (under `public/`) to modernize the UI and add features:

- Modernized styling and design system in `public/css/style.css`.
- Improved `public/cars.html` with search/sort, image preview, edit/cancel, card layout, and inline alerts.
- Standardized buttons and forms across `index.html`, `login.html`, and `cars.html`.
- Added client-side validation to `public/js/cars.js`, `public/js/login.js`, and `public/js/register.js`.

How to run the front-end
------------------------
1. Start your backend server and ensure it runs at `http://localhost:5001` with these endpoints:
	- POST `/api/users/register`
	- POST `/api/users/login` (returns JSON `{ accessToken }`)
	- GET `/api/cars`
	- GET `/api/cars/:id`
	- POST `/api/cars` (accepts multipart/form-data for file upload)
	- PUT `/api/cars/:id`
	- DELETE `/api/cars/:id`

2. Serve the `public/` folder or open the HTML files directly in a browser:
	- `public/index.html` — register
	- `public/login.html` — login
	- `public/cars.html` — cars dashboard

Quick manual tests
------------------
- Create an account via `index.html` and sign in on `login.html`.
- After signing in, click "Go to Products" and use `cars.html`.
- Add a car with an image, try search & sort, edit an item, and delete an item.

Notes
-----
- The front-end expects existing car objects to optionally include a `base64` property for images (data URI style). New uploads are sent as `multipart/form-data`.
- If you want, I can add client-side unit tests, accessibility improvements, or convert the UI to a small SPA.

If something fails, open the browser console and copy any errors or failing network requests here and I will debug them.
