import { Router } from "express";
import {
  createAMCContract,
  getMyAMCContracts,
  getAMCById,
  listAllAMCContracts,
  updateAMCContract,
  updateAMCStatus,
  recordAMCVisit,
  downloadFormBPdf,
} from "../controllers/amc.controller";
import { requireAuth, requirePermission } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import {
  createAMCContractSchema,
  updateAMCContractSchema,
  recordAMCVisitSchema,
} from "../validators/amc.validators";

const router = Router();

router.get("/", requireAuth, (req, res, next) => {
  const perms = (req as any).user?.permissions || [];
  if (perms.includes("amc.read")) return listAllAMCContracts(req, res, next);
  return getMyAMCContracts(req, res, next);
});
router.get("/my", requireAuth, getMyAMCContracts);
router.get("/my-contracts", requireAuth, getMyAMCContracts);
router.get("/all", requireAuth, requirePermission("amc.read"), listAllAMCContracts);
router.get("/admin", requireAuth, requirePermission("amc.read"), listAllAMCContracts);
router.get("/admin/:id", requireAuth, requirePermission("amc.read"), getAMCById);
router.patch("/admin/:id/status", requireAuth, requirePermission("amc.manage"), updateAMCStatus);

router.get("/:id", requireAuth, getAMCById);
router.get("/:id/form-b", requireAuth, downloadFormBPdf);
router.post("/", requireAuth, requirePermission("amc.manage"), validateBody(createAMCContractSchema), createAMCContract);
router.put("/:id", requireAuth, requirePermission("amc.manage"), validateBody(updateAMCContractSchema), updateAMCContract);
router.patch("/:id/status", requireAuth, requirePermission("amc.manage"), updateAMCStatus);
router.post("/:id/visits", requireAuth, requirePermission("services.update"), validateBody(recordAMCVisitSchema), recordAMCVisit);

export default router;
