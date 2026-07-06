# Task Manager — Backend

Django + DRF backend for the Task Manager & Image Annotation app.

## Tech Stack

- Python 3.12
- Django 6.0
- Django REST Framework 3.17
- SimpleJWT (JWT auth)
- SQLite
- Pillow (image processing)

## Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser  # or use the demo user
python manage.py runserver
```

### Demo user

```
email:    demo@vairad.com
password: DemoPass123!
```

## Environment variables

- `DEBUG` — set to `False` in production
- `CORS_ALLOWED_ORIGINS` — comma-separated frontend URLs

## API Endpoints

| Method | Path                | Description          |
|--------|---------------------|----------------------|
| POST   | /api/auth/register/ | Register new user    |
| POST   | /api/auth/login/    | Login, get JWT       |
| POST   | /api/auth/refresh/  | Refresh access token |
| GET    | /api/auth/me/       | Current user         |
| GET    | /api/tasks/         | List tasks (filter by `?due_date=`) |
| POST   | /api/tasks/         | Create task          |
| PUT    | /api/tasks/{id}/    | Update task          |
| DELETE | /api/tasks/{id}/    | Delete task          |
| POST   | /api/tasks/reorder/ | Reorder tasks in a column |
| GET    | /api/images/        | List uploaded images (nested polygons) |
| POST   | /api/images/        | Upload image         |
| DELETE | /api/images/{id}/   | Delete image         |
| GET    | /api/polygons/      | List polygons (`?image=`) |
| POST   | /api/polygons/      | Create polygon       |
| DELETE | /api/polygons/{id}/ | Delete polygon       |

## Difficulties encountered

- **Custom User model timing**: `AUTH_USER_MODEL` must be set before the first migration or you have to start over. I set it in settings.py before any `makemigrations` ran.
- **JWT refresh flow**: The Axios interceptor for token refresh needed a dedicated queue to handle concurrent 401s without multiple simultaneous refresh calls.
- **Django 6 changes**: Django 6 uses `STATIC_URL` without the trailing slash in defaults, and `formats.py` structure differs slightly from Django 5.
