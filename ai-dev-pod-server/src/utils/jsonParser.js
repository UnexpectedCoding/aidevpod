// utils/jsonParser.js

class JSONParser {
  static safeParse(input) {
    try {
      if (typeof input !== "string") {
        throw new Error("Input must be a string");
      }

      // Extract JSON block if wrapped in text
      const start = input.indexOf("{");
      const end = input.lastIndexOf("}");

      if (start === -1 || end === -1) {
        throw new Error("No valid JSON object found in input");
      }

      const jsonString = input.substring(start, end + 1);

      return {
        success: true,
        data: JSON.parse(jsonString),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  static isValidJSON(input) {
    try {
      JSON.parse(input);
      return true;
    } catch {
      return false;
    }
  }

  static stringifyPretty(data) {
    try {
      return JSON.stringify(data, null, 2);
    } catch (error) {
      throw new Error("Failed to stringify JSON");
    }
  }
}

module.exports = JSONParser;