from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, users, finance, plots, polls, forum, chat, content

app = FastAPI(title="СПК «Хорошово-1» — Full Industrial Portal (из загруженного архива)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(finance.router)
app.include_router(plots.router)
app.include_router(polls.router)
app.include_router(forum.router)
app.include_router(chat.router)
app.include_router(content.router)