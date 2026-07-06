# TaskFlow — Backend

> Django 5 + Django REST Framework backend for the **Task Manager & Image Annotation** app. Custom user model with JWT auth, full CRUD for tasks, and image/polygon annotation with SQLite persistence.

---

## 🛠 Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| Python | **3.12** | Runtime |
| Django | 5.x | Web framework |
| Django REST Framework | 3.17 | REST API |
| SimpleJWT | latest | JWT authentication |
| Pillow | latest | Image dimension extraction |
| SQLite | built-in | Database |

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DEBUG` | `True` | Set to `False` in production |
| `CORS_ALLOWED_ORIGINS` | *(see settings.py)* | Comma-separated allowed frontend URLs |

---

## 🚀 Setup & Running

### Prerequisites
- **Python 3.12** (`python3 --version` to check)
- `pip` (bundled with Python 3.12)
- `venv` module (bundled with Python 3.12)

### Steps

```bash
# 1. Enter the backend directory
cd backend

# 2. Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate          # Linux/macOS
# venv\Scripts\activate           # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run database migrations
python manage.py migrate

# 5. Create the demo superuser (optional, or use the one below)
python manage.py createsuperuser

# 6. Start the development server
python manage.py runserver
```

The API will be available at **http://localhost:8000**

---

## 👤 Demo User

The database already contains a demo user (after running migrations and seeding):

```
Email:    demo@vairad.com
Password: DemoPass123!
```

To create it manually:
```bash
python manage.py shell -c "
from accounts.models import User
User.objects.create_superuser(email='demo@vairad.com', username='demo', password='DemoPass123!')
"
```

---

## 📂 Project Structure

```
backend/
├── core/                    # Django project settings & root URLs
│   ├── settings.py
│   └── urls.py
├── accounts/                # Custom User model (email-based login)
│   ├── models.py            # User extends AbstractUser, email=USERNAME_FIELD
│   ├── serializers.py
│   ├── views.py             # /auth/login/, /auth/register/, /auth/refresh/, /auth/me/
│   └── urls.py
├── tasks/                   # Kanban task management
│   ├── models.py            # Task: title, status, priority, due_date, tags (JSON), position
│   ├── serializers.py
│   ├── views.py             # CRUD + /tasks/reorder/
│   └── urls.py
├── annotations/             # Image upload & polygon annotation
│   ├── models.py            # AnnotationImage + Polygon (normalized points JSON)
│   ├── serializers.py
│   ├── views.py             # /images/ and /polygons/ endpoints
│   └── urls.py
├── media/                   # Uploaded images (served in dev by Django)
├── db.sqlite3               # SQLite database
├── manage.py
└── requirements.txt
```

---

## 📡 API Endpoints

### Auth (`/api/auth/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register/` | Create new user (email, username, password) |
| `POST` | `/auth/login/` | Login → returns `{ access, refresh }` JWT pair |
| `POST` | `/auth/refresh/` | Refresh access token using refresh token |
| `GET`  | `/auth/me/` | Returns current authenticated user info |

### Tasks (`/api/tasks/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/tasks/?due_date=YYYY-MM-DD` | List tasks (optional date filter) |
| `POST` | `/tasks/` | Create a new task |
| `GET`  | `/tasks/{id}/` | Retrieve single task |
| `PUT`  | `/tasks/{id}/` | Update task (full) |
| `PATCH`| `/tasks/{id}/` | Update task (partial) |
| `DELETE` | `/tasks/{id}/` | Delete task |
| `POST` | `/tasks/reorder/` | Reorder tasks in a column `{ ordered_ids, status }` |

### Annotations (`/api/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/images/` | List all uploaded images (with nested polygons) |
| `POST` | `/images/` | Upload an image (multipart/form-data) |
| `DELETE` | `/images/{id}/` | Delete image and all its polygons |
| `GET`  | `/polygons/?image={id}` | List polygons for an image |
| `POST` | `/polygons/` | Create a polygon `{ image, points, color }` |
| `DELETE` | `/polygons/{id}/` | Delete a specific polygon |

---

## 🗄 Data Models

### Task
```python
class Task(models.Model):
    owner      # ForeignKey → User
    title      # CharField(255)
    description# TextField (blank)
    status     # Choice: todo | in_progress | done
    priority   # Choice: low | medium | high
    due_date   # DateField (indexed, nullable)
    tags       # JSONField (list of strings)
    position   # PositiveIntegerField (for column ordering)
    created_at / updated_at
```

### AnnotationImage
```python
class AnnotationImage(models.Model):
    owner      # ForeignKey → User
    image      # ImageField (upload_to='uploads/')
    original_filename # CharField
    width, height     # PositiveIntegerField (extracted by Pillow)
    uploaded_at
```

### Polygon
```python
class Polygon(models.Model):
    image      # ForeignKey → AnnotationImage (CASCADE)
    label      # CharField (optional label)
    points     # JSONField (list of [x, y] normalized 0-1 floats)
    color      # CharField(7) e.g. "#4f8ef7"
    created_at
```

---

## ⚔️ Difficulties & How I Overcame Them (The Villains)

### Villain 1: Custom `AUTH_USER_MODEL` Timing
**The problem:** Django's `AUTH_USER_MODEL` must be declared in `settings.py` *before* the very first `makemigrations` run. If you set it after initial migrations exist for auth or any app that references the user, you get a maze of dependency errors.

**How I won:** I set `AUTH_USER_MODEL = "accounts.User"` in `settings.py` before running any `migrate` commands. The initial migration for `accounts` was created first, and all other apps that reference the user model (tasks, annotations) depend on `accounts.0001`. Confirmed by using `python manage.py migrate --run-syncdb` to verify no orphaned dependencies.

### Villain 2: JWT Refresh + `ROTATE_REFRESH_TOKENS`
**The problem:** `ROTATE_REFRESH_TOKENS = True` in SimpleJWT means every refresh call invalidates the old refresh token and returns a new one. The frontend must update its stored refresh token after every silent refresh, or the next refresh will fail with a 401.

**How I won:** The Axios interceptor in the frontend saves the new `{ access, refresh }` pair to both localStorage and the cookie after every successful refresh call, so the next expiry cycle always has a valid refresh token.

### Villain 3: Serving Media Files in Development
**The problem:** Django doesn't serve `MEDIA_URL` files in development by default (only `STATIC_URL`). Uploaded images returned by the API as relative paths like `/media/uploads/foo.jpg` would 404.

**How I won:** Added the `static()` helper from `django.conf.urls.static` in `core/urls.py` for `DEBUG=True` mode:
```python
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

### Villain 4: CORS for the Next.js Dev Server
**The problem:** Next.js dev server runs on port 3000, Django on 8000 — different origins. All API calls fail with CORS errors without explicit headers.

**How I won:** Added `django-cors-headers` to `INSTALLED_APPS` and `MIDDLEWARE`, then set `CORS_ALLOWED_ORIGINS = ["http://localhost:3000"]` in settings. For production, this is overridden via environment variable.

### Villain 5: Image Dimension Extraction with Pillow
**The problem:** The frontend needs the natural image dimensions to set the SVG `viewBox` correctly. The `ImageField` alone doesn't store `width`/`height`.

**How I won:** Overrode `save()` in `AnnotationImage` to open the uploaded file with `PIL.Image.open()` and write `self.width` and `self.height` before calling `super().save()`. This keeps the dimensions accurate even if the same filename is re-uploaded.

---

## 📋 requirements.txt

```
django>=5.0,<6.0
djangorestframework>=3.17
djangorestframework-simplejwt
django-cors-headers
Pillow
```
