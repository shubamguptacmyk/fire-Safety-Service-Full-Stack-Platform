import { Router } from "express";
import {
  getCart,
  addItem,
  updateQuantity,
  removeItem,
  clearCart,
  syncCart,
} from "../controllers/cart.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  addCartItemSchema,
  updateCartItemSchema,
  syncCartSchema,
} from "../validators/cart.validators";

const router = Router();

router.use(requireAuth);

router.get("/", getCart);
router.post("/", validate(addCartItemSchema), addItem);
router.post("/items", validate(addCartItemSchema), addItem);
router.patch("/items/:productId", validate(updateCartItemSchema), updateQuantity);
router.put("/items/:productId", validate(updateCartItemSchema), updateQuantity);
router.delete("/items/:productId", removeItem);
router.delete("/", clearCart);
router.post("/sync", validate(syncCartSchema), syncCart);

export default router;
