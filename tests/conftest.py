import os

os.environ["ENVIRONMENT"] = "test"
os.environ["DATABASE_URL"] = "sqlite:///./test.db"
os.environ["REDIS_URL"] = ""
os.environ["JWT_SECRET"] = "test-secret-with-at-least-32-bytes"
