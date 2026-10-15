FROM python:3.12-slim
WORKDIR /service
COPY pyproject.toml ./
COPY app ./app
RUN pip install --no-cache-dir .
USER 10001:10001
EXPOSE 8000
CMD ["python", "-m", "app.run"]
