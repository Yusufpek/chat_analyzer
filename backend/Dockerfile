FROM python:3.13-bookworm

# Create a non-root user and group
RUN groupadd -g 1001 chat_analyzer && \
    useradd -u 1001 -g chat_analyzer -s /bin/false -M chat_analyzer

ENV PIP_DISABLE_PIP_VERSION_CHECK=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y \
    libldap2-dev=2.5.13+dfsg-5 \
    libsasl2-dev=2.1.28+dfsg-10 \
    libpq-dev \
    postgresql-client=15+248 \
    iputils-ping=3:20221126-1+deb12u1  \    
    && rm -rf /var/lib/apt/lists/*

COPY ./requirements.txt /tmp/
RUN python -m pip install -r /tmp/requirements.txt

WORKDIR /app

COPY app/ ./

RUN chown -R chat_analyzer:chat_analyzer /app && chmod -R 755 /app

# Switch to the non-root user
USER chat_analyzer


