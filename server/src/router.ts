import express from "express";
import advertActions from "./modules/advert/advertActions";
import advertServices from "./modules/advert/advertServices";
import authActions from "./modules/auth/authActions";
import authServices from "./modules/auth/authServices";
import goatActions from "./modules/goat/goatActions";
import mainTagActions from "./modules/mainTag/mainTagActions";
import confirmReservation from "./modules/reservation/reservationActions";
import slotActions from "./modules/slot/slotActions";
import fileUpload from "./services/fileUpload";

const router = express.Router();

/* ************************************************************************* */
// Define Your API Routes Here
/* ************************************************************************* */

// Public routes

router.post(
	"/api/goats",
	fileUpload.any(),
	authServices.hashPassword,
	goatActions.add,
);
router.post("/api/login", authActions.login);

router.get("/api/main-tags", mainTagActions.browse);
router.get("/api/adverts", advertActions.browse);

router.get(
	"/advert/search/subtag/:mainTagId",
	advertActions.getSubTagsByMainTag,
);
router.get("/advert/maintags", advertActions.getMainTags);

router.get("/search/description", advertActions.searchDescription);
router.get("/search/maintags", advertActions.searchMainTagsByName);
router.get("/search/subtags", advertActions.searchSubTagsByName);

router.get("/filter/advert", advertActions.filterAdverts);
router.patch("/api/slots/:slotId", slotActions.book);
// Apply auth middleswares for all followings routes
router.use(authServices.isAuth);

// Private routes
router.post("/api/adverts", advertServices.validateAdvert, advertActions.add);
router.post("/api/send-confirmation-email", confirmReservation);

router.post(
	"/api/goats",
	fileUpload.any(),
	authServices.hashPassword,
	goatActions.add,
);
router.get("/api/goats/:id", goatActions.read);
router.get("/api/adverts/:id", advertActions.read);

export default router;
