export const validate = (schema, data) => {
  try {
    return schema.parse(data);
  } catch (error) {
    throw new Error(error.errors.map((e) => e.message).join(', '));
  }
};
