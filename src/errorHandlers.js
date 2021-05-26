export const notFoundErrorHandler = (err, req, res, next) => {
  if (err && err.status === 404) {
    res.status(404).send(err.message || "Error not found!");
  } else {
    next(err); // I need to pass the error to the next error middleware
  }
};

export const badRequestErrorHandler = (err, req, res, next) => {
  if (err && err.status === 400) {
    res
      .status(400)
      .send({ message: err.message || "not found!", errors: err.errors || [] });
  } else {
    next(err);
  }
};

export const forbiddenErrorHandler = (err, req, res, next) => {
  if (err && err.status === 403) {
    res.status(403).send("Forbidden!");
  } else {
    next(err);
  }
};

export const catchAllErrorHandler = (err, req, res, next) => {
  res.status(500).send({ message: err.message || "Generic Server Error" });
};
