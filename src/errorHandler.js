export const badRequestError = (err, request, response, next) => {
  console.log("ERR ", err);
  if (err.status === 400) {
    response
      .status(400)
      .send({ message: err.message, errorsList: err.errorsList });
  } else {
    next(err);
  }
};

export const unauthorizedError = (err, request, response, next) => {
  if (err.status === 401) {
    response.status(401).send({ message: "Unauthorized!" });
  } else {
    next(err);
  }
};

export const notFoundError = (err, request, response, next) => {
  if (err.status === 404) {
    response.status(404).send({ message: err.message || "Not found!" });
  } else {
    next(err);
  }
};

export const errorHandler = (err, request, response, next) => {
  console.log(err);

  response.status(500).send({ message: "This is a Server error" });
};
