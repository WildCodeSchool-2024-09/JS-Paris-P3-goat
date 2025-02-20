import type { NextFunction, Request, RequestHandler, Response } from "express";
import slotRepository from "./slotRepository";

const book: RequestHandler = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const slot = req.body;
		slot.id = req.params.slotId;

		const result = await slotRepository.update(slot);

		if (result.affectedRows > 0) {
			res.json(result);
		} else res.sendStatus(422);
	} catch (err) {
		next(err);
	}
};

export default {
	book,
};
