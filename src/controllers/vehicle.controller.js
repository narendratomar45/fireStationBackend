import { ApiError } from "#utils/ApiError.js";
import { ApiResponse } from "#utils/ApiResponse.js";
import { asyncHandler } from "#utils/asyncHandler.js";
import { Vehicle } from "../models/vehicle.model.js";
const createVehicle = asyncHandler(async (req, res) => {
  const {
    name,
    type,
    callSign,
    status,
    lastMaintenance,
    nextMaintenance,
    fuelLevel,
    location,
    number,
  } = req.body;

  if (
    !name ||
    !type ||
    !callSign ||
    !status ||
    !lastMaintenance ||
    !nextMaintenance ||
    !fuelLevel ||
    !location ||
    !number
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existingVehicle = await Vehicle.findOne({ number });
  if (existingVehicle) {
    throw new ApiError(400, "Vehicle with this number already exists");
  }
  const vehicle = await Vehicle.create({
    name,
    type,
    callSign,
    status,
    lastMaintenance,
    nextMaintenance,
    fuelLevel,
    location,
    number,
  });
  res
    .status(201)
    .json(new ApiResponse(true, vehicle, "Vehicle created successfully"));
});

const getAllVehicles = asyncHandler(async (req, res) => {
  let { page = 1, limit = 10 } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);
  const skip = (page - 1) * limit;

  const vehicles = await Vehicle.find({}).skip(skip).limit(limit);
  const totalVehicles = await Vehicle.countDocuments();
  const totalPages = Math.ceil(totalVehicles / limit);

  const response = {
    vehicles,
    totalVehicles,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    previousPage: page > 1 ? page - 1 : null,
  };

  res.status(200).json(new ApiResponse(200, response, "Vehicles fetched"));
});

const getVehicleById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid vehicle ID format");
  }
  const vehicle = await Vehicle.findById(id);
  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }
  res.status(200).json(new ApiResponse(201, vehicle, "Vehicle fetched"));
});

const updateVehicle = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid vehicle ID format");
  }
  const vehicle = await Vehicle.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }
  res.status(200).json(new ApiResponse(201, vehicle, "Vehicle updated"));
});

const deleteVehicle = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid vehicle ID format");
  }
  const vehicle = await Vehicle.findByIdAndDelete(id);
  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }
  res.status(200).json(new ApiResponse(201, vehicle, "Vehicle deleted"));
});
export {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
};
