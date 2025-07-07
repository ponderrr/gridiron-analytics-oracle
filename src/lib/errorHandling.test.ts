import {
  createAppError,
  formatErrorMessage,
  getErrorType,
  withErrorHandling,
} from "./errorHandling";

describe("errorHandling", () => {
  it("creates an AppError with correct properties", () => {
    const err = createAppError(
      "Test error",
      "data",
      404,
      "context",
      "original"
    );
    expect(err.message).toBe("Test error");
    expect(err.type).toBe("data");
    expect(err.status).toBe(404);
    expect(err.context).toBe("context");
    expect(err.originalError).toBe("original");
  });

  it("formats error messages from string and object", () => {
    expect(formatErrorMessage("msg")).toBe("msg");
    expect(formatErrorMessage({ message: "objmsg" })).toBe("objmsg");
    expect(formatErrorMessage({})).toBe("An unknown error occurred.");
  });

  it("gets error type from AppError and common patterns", () => {
    expect(getErrorType(createAppError("msg", "auth"))).toBe("auth");
    expect(getErrorType({ code: "ECONNREFUSED" })).toBe("network");
    expect(getErrorType({ code: "401" })).toBe("auth");
    expect(getErrorType({ code: "404" })).toBe("data");
    expect(getErrorType({ code: "timeout" })).toBe("timeout");
    expect(getErrorType({ message: "network error" })).toBe("network");
    expect(getErrorType({ message: "not found" })).toBe("data");
    expect(getErrorType({ message: "timeout" })).toBe("timeout");
    expect(getErrorType({})).toBe("unknown");
  });

  it("withErrorHandling wraps async function and catches errors", async () => {
    const fn = withErrorHandling(async (x: number) => {
      if (x < 0) throw new Error("fail");
      return x * 2;
    }, "test");
    await expect(fn(2)).resolves.toBe(4);
    await expect(fn(-1)).rejects.toThrow("fail");
  });
});
