export function validate(schema) {
  return async (req, res, next) => {
    try {
      if (typeof schema?.parseAsync === 'function') {
        req.body = await schema.parseAsync(req.body ?? {});
        return next();
      }

      if (schema?.params) {
        req.params = await schema.params.parseAsync(req.params);
      }

      if (schema?.query) {
        const parsedQuery = await schema.query.parseAsync(req.query);
        Object.defineProperty(req, 'query', {
          value: parsedQuery,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }

      if (schema?.body) {
        req.body = await schema.body.parseAsync(req.body ?? {});
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };
}

