import { Router } from "express";
const router = Router();
import {
  createVehicle,
  deleteVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
} from "#controllers/vehicle.controller.js";
import verifyJWT from "#middleware/user.middleware.js";

router.use(verifyJWT);

router.route("/").post(createVehicle).get(getAllVehicles);
router
  .route("/:id")
  .get(getVehicleById)
  .patch(updateVehicle)
  .delete(deleteVehicle);

export default router;
