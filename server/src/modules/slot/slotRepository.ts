import databaseClient from "../../../database/client";
import type { Result, Rows } from "../../../database/client";
import type { Slot } from "../../types/slot";

class slotRepository {
	async create(slot: Slot) {
		const [result] = await databaseClient.query<Result>(
			"INSERT INTO slot (start_at, advert_id) VALUES (?, ?)",
			[slot.start_at, slot.advert_id],
		);
		return result.insertId;
	}

	async readAllByAdvertId(advertId: number) {
		const [slots] = await databaseClient.query<Rows>(
			"SELECT * FROM slot WHERE slot.advert_id = ?",
			[advertId],
		);
		return slots;
	}

	async update(slot: Slot) {
		const [result] = await databaseClient.query<Result>(
			"UPDATE slot SET ? WHERE id= ?",
			[slot, slot.id],
		);
		return result;
	}
}

export default new slotRepository();
