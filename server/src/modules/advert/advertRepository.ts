import databaseClient from "../../../database/client";
import type { Result, Rows } from "../../../database/client";
import type { Advert } from "../../types/advert";
import type { Slot } from "../../types/slot";

class AdvertRepository {
	async create(advert: Omit<Advert, "id">): Promise<number> {
		const goatId = advert.goat_id;
		const mainTagId = advert.main_tag_id;
		const subTagId = advert.sub_tag_id;

		if (!goatId || !mainTagId || !subTagId) {
			throw new Error("Goat, main_tag, or sub_tag id is missing");
		}

		const [result] = await databaseClient.query<Result>(
			"INSERT INTO advert (goat_id, main_tag_id, sub_tag_id, description) VALUES (?, ?, ?, ?)",
			[goatId, mainTagId, subTagId, advert.description],
		);

		return result.insertId;
	}

	async createSlot(slot: Slot): Promise<number> {
		const [result] = await databaseClient.query<Result>(
			"INSERT INTO slot (start_at, duration, meet_link, comment, advert_id) VALUES (?, ?, ?, ?, ?)",
			[slot.start_at, slot.comment, slot.advert_id],
		);
		return result.insertId;
	}

	async read(id: number): Promise<Advert | null> {
		const [rows] = await databaseClient.query<Rows>(
			"SELECT * FROM advert WHERE id = ?",
			[id],
		);
		return (rows[0] as Advert) || null;
	}

	async readConfirmationDetails(id: number): Promise<Advert | null> {
		const [rows] = await databaseClient.query<Rows>(
			"SELECT id, goat_id, main_tag_name, sub_tag_name, goat_firstname, description, date, time FROM advert WHERE id = ?",
			[id],
		);
		return (rows[0] as Advert) || null;
	}

	async readAll(): Promise<Advert[]> {
		const [rows] = await databaseClient.query<Rows>("SELECT * FROM advert");
		return rows as Advert[];
	}

	async searchDescription(query: string): Promise<string[]> {
		try {
			const [rows] = await databaseClient.query<Rows>(
				"SELECT description FROM advert WHERE description LIKE ?",
				[`%${query}%`],
			);

			const regex = new RegExp(`\\b${query}\\w*\\b`, "gi");
			const matchedWords: string[] = [];

			for (const row of rows) {
				const description = row.description;
				const matches = description.match(regex);
				if (matches) {
					matchedWords.push(...matches);
				}
			}

			return matchedWords;
		} catch (error) {
			console.error("Erreur SQL :", error);
			throw error;
		}
	}

	async getMainTags(): Promise<{ id: number; name: string }[]> {
		try {
			const [rows] = await databaseClient.query<Rows>(
				"SELECT id, name FROM main_tag",
			);
			return rows as { id: number; name: string }[];
		} catch (error) {
			console.error(
				"Erreur SQL lors de la récupération des main tags :",
				error,
			);
			throw error;
		}
	}

	async searchMainTagsByName(
		query: string,
	): Promise<{ id: number; name: string }[]> {
		try {
			const [rows] = await databaseClient.query<Rows>(
				"SELECT id, name FROM main_tag WHERE name LIKE ?",
				[`%${query}%`],
			);
			return rows as { id: number; name: string }[];
		} catch (error) {
			console.error(
				"Erreur SQL lors de la recherche de main tags par nom :",
				error,
			);
			throw error;
		}
	}

	async searchSubTagsByName(
		query: string,
	): Promise<{ id: number; name: string }[]> {
		try {
			const [rows] = await databaseClient.query<Rows>(
				"SELECT id, name FROM sub_tag WHERE name LIKE ?",
				[`%${query}%`],
			);
			return rows as { id: number; name: string }[];
		} catch (error) {
			console.error(
				"Erreur SQL lors de la recherche de sub tags par nom :",
				error,
			);
			throw error;
		}
	}

	async filterByTags(mainTagId: number, subTagId: number): Promise<Advert[]> {
		try {
			const [rows] = await databaseClient.query<Rows>(
				"SELECT * FROM advert WHERE main_tag_id = ? AND sub_tag_id = ?",
				[mainTagId, subTagId],
			);
			return rows as Advert[];
		} catch (error) {
			console.error("Erreur SQL lors de la filtration des annonces :", error);
			throw error;
		}
	}
	async takeSubTagsByMainTag(
		mainTagId: number,
	): Promise<{ id: number; name: string }[]> {
		try {
			const [rows] = await databaseClient.query<Rows>(
				"SELECT sub_tag.id, sub_tag.name FROM sub_tag JOIN main_sub_tag ON sub_tag.id = main_sub_tag.sub_tag_id WHERE main_sub_tag.main_tag_id = ?",
				[mainTagId],
			);
			return rows as { id: number; name: string }[];
		} catch (error) {
			console.error("Erreur SQL récupération des sous-tags:", error);
			throw error;
		}
	}
}

export default new AdvertRepository();
