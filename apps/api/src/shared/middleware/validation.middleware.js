// Lightweight input validation middleware — no heavy dependencies
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateBody = (rules) => (req, res, next) => {
    const errors = [];

    for (const [field, rule] of Object.entries(rules)) {
        const value = req.body[field];

        if (rule.required && (value === undefined || value === null || value === "")) {
            errors.push({ field, message: `${field} is required` });
            continue;
        }

        if (value === undefined || value === null) continue;

        if (rule.type === "email" && !emailRegex.test(value)) {
            errors.push({ field, message: `${field} must be a valid email address` });
        }

        if (rule.minLength && String(value).length < rule.minLength) {
            errors.push({ field, message: `${field} must be at least ${rule.minLength} characters` });
        }

        if (rule.maxLength && String(value).length > rule.maxLength) {
            errors.push({ field, message: `${field} must be at most ${rule.maxLength} characters` });
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({ message: "Validation failed", errors });
    }

    next();
};

export const validateRegister = validateBody({
    name: { required: true, minLength: 2, maxLength: 50 },
    email: { required: true, type: "email" },
    password: { required: true, minLength: 8, maxLength: 100 },
});

export const validateLogin = validateBody({
    email: { required: true, type: "email" },
    password: { required: true, minLength: 1 },
});

export const validateCreateIssue = validateBody({
    title: { required: true, minLength: 5, maxLength: 200 },
    description: { required: true, minLength: 10, maxLength: 10000 },
});

export const validateCreateComment = validateBody({
    content: { required: true, minLength: 1, maxLength: 5000 },
});
