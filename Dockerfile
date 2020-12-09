FROM node:12.20-buster

ARG AWS_KEY
ARG AWS_REGION
ARG AWS_SECRET

RUN apt-get update && apt-get install -y vim \
    less \
    zip

RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install && \
    rm -r ./aws && \
    rm ./awscliv2.zip

RUN mkdir -p ~/.aws && \
    touch ~/.aws/credentials && \
    echo [default] >> ~/.aws/credentials && \
    echo "aws_access_key_id = ${AWS_KEY}" >> ~/.aws/credentials && \
    echo "aws_secret_access_key = ${AWS_SECRET}" >> ~/.aws/credentials

RUN touch ~/.aws/config && \
    echo [default] >> ~/.aws/config && \
    echo "region = ${AWS_REGION}" >> ~/.aws/config

RUN npm install -g @aws-amplify/cli