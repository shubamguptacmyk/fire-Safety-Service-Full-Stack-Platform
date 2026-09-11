import { Router } from "express";
import {
  getWishlist,
  toggleWishlist,
  removeItem,
  clearWishlist,
} from "../controllers/wishlist.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/", getWishlist);
router.post("/toggle", toggleWishlist);
router.post("/:productId", toggleWishlist);
router.delete("/:productId", removeItem);
router.delete("/", clearWishlist);

export default router;
