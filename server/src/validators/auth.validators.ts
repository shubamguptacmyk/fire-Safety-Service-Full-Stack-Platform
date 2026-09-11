import { z } from "zod";

export const registerSchema = z.object({
  body: z
    .object({
      name: z.string({ required_error: "Full Name is required" }).min(2, "Name must be at least 2 characters"),
      phone: z.string({ required_error: "Mobile Number is required" }).regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
      email: z
        .string({ required_error: "Email Address is required" })
        .min(1, "Email Address is required")
        .email("Enter a valid email address")
        .transform((val) => val.trim().toLowerCase()),
      password: z.string({ required_error: "Password is required" }).min(8, "Password must be at least 8 characters"),
      confirmPassword: z.string().optional(),
      customerType: z.enum(["b2c", "b2b", "corporate"]).optional().default("b2c"),
      companyName: z.string().optional(),
      gstNumber: z.string().optional(),
    })
    .refine(
      (data) => {
        if (!data.confirmPassword) return true;
        return data.password === data.confirmPassword;
      },
      {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      }
    )
    .refine(
      (data) => {
        if ((data.customerType === "b2b" || data.customerType === "corporate") && (!data.companyName || !data.companyName.trim())) {
          return false;
        }
        return true;
      },
      {
        message: "Company Name is required for Business and Corporate accounts",
        path: ["companyName"],
      }
    ),
});

export const loginSchema = z.object({
  body: z.object({
    identifier: z.string().min(3, "Enter your email or phone"), // email OR phone
    password: z.string().min(1, "Password is required"),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(10, "refreshToken is required"),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({ email: z.string().email("Enter a valid email address") }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(10, "Token is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  }),
});

export const verifyEmailSchema = z
  .object({
    body: z
      .object({
        token: z.string().min(10, "Verification token is required").optional(),
      })
      .optional(),
    query: z
      .object({
        token: z.string().min(10, "Verification token is required").optional(),
      })
      .optional(),
  })
  .refine(
    (data) => {
      const bodyToken = data?.body?.token?.trim();
      const queryToken = data?.query?.token?.trim();
      return (bodyToken && bodyToken.length >= 10) || (queryToken && queryToken.length >= 10);
    },
    {
      message: "Verification token is required",
      path: ["token"],
    }
  );

export const resendVerificationSchema = z.object({
  body: z.object({
    email: z.string().min(1, "Email address is required"),
  }),
});
