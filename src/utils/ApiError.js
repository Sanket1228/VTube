class ApiError {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        this.statusCode = statusCode;
        this.message = message;
        this.success = false;
        this.errors = errors;
    }
}

export { ApiError };
