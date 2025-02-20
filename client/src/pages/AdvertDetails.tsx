import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import "./AdvertDetails.css";
import type { AppContextInterface } from "../types/appContext.type";

interface Slot {
	id: number;
	date: string;
	hour: string;
	start_at: string;
}

interface Advert {
	goat_id: number;
	goat_picture: string;
	goat_firstname: string;
	description: string;
	main_tag_name: string;
	sub_tag_name: string;
	slots: Slot[];
}

const AdvertDetails = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { user } = useOutletContext<AppContextInterface>();

	const [advert, setAdvert] = useState<Advert | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [message, setMessage] = useState("");
	const [reservedSlots, setReservedSlots] = useState<Slot[]>([]);

	useEffect(() => {
		if (!user?.token) {
			setError("Utilisateur non authentifié");
			setLoading(false);
			return;
		}

		const fetchAdvertDetails = async () => {
			try {
				const response = await fetch(
					`${import.meta.env.VITE_API_URL}/api/adverts/${id}`,
					{
						headers: { Authorization: `Bearer ${user.token}` },
					},
				);
				if (!response.ok)
					throw new Error("Erreur lors du chargement des données.");
				const data = await response.json();
				setAdvert(data);
			} catch (err) {
				setError((err as Error).message);
			} finally {
				setLoading(false);
			}
		};
		fetchAdvertDetails();
	}, [id, user]);

	const handleConfirm = async () => {
		if (selectedSlot === null) {
			setError("Veuillez sélectionner un créneau");
		} else if (reservedSlots.some((slot) => slot.id === selectedSlot.id)) {
			setError("Ce créneau est occupé.");
		}

		if (!selectedSlot || !user?.token || !advert) return;

		const reservationData = {
			goat_id: advert.goat_id,
			comment: message,
		};

		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/api/slots/${selectedSlot.id}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${user.token}`,
					},
					body: JSON.stringify(reservationData),
				},
			);

			if (!response.ok) throw new Error("Erreur lors de la réservation.");

			const updatedReservations = [...reservedSlots, selectedSlot];
			setReservedSlots(updatedReservations);
			localStorage.setItem("reservations", JSON.stringify(updatedReservations));

			setIsModalOpen(false);
			navigate(`/profile/${user.id}`);
		} catch (err) {
			setError((err as Error).message);
		}
	};

	if (loading) return <div>Chargement...</div>;
	if (error) return <div>Erreur : {error}</div>;
	if (!advert) return <div>Aucune annonce trouvée</div>;

	return (
		<div className="advert-container">
			<div className="advert-profile">
				<div className="profile-header">
					<img
						className="img-goat"
						src={
							advert.goat_picture.startsWith("https")
								? advert.goat_picture
								: `http://localhost:3310/upload/${advert.goat_picture}`
						}
						alt={advert.goat_firstname}
					/>
					<h1 className="profile-name">{advert.goat_firstname}</h1>
				</div>
				<div className="profile-tags">
					<button type="button" className="tag-button-main">
						{advert.main_tag_name}
					</button>
					<button type="button" className="tag-button-sub">
						{advert.sub_tag_name}
					</button>
				</div>
				<p className="profile-description">{advert.description}</p>
			</div>
			<div className="profile-calendar">
				<h1>Sélectionnez une date</h1>
				{advert.slots.map((slot) => (
					<button
						key={slot.id}
						type="button"
						className={`slot-button ${selectedSlot?.id === slot.id ? "selected" : ""}`}
						onClick={() => {
							if (selectedSlot?.id === slot.id) {
								setSelectedSlot(null);
							} else {
								setSelectedSlot(slot);
							}
						}}
						disabled={reservedSlots.some(
							(reservedSlot) => reservedSlot.id === slot.id,
						)}
					>
						{new Date(slot.start_at).toLocaleString("fr-FR", {
							weekday: "long",
							day: "2-digit",
							month: "long",
							hour: "2-digit",
							minute: "2-digit",
						})}
					</button>
				))}
				<div className="advert-reservation">
					<button
						type="button"
						className="reservation-button"
						onClick={() => setIsModalOpen(true)}
						disabled={!selectedSlot}
					>
						Réserver
					</button>
					{isModalOpen && (
						<div className="modal-overlay">
							<div className="modal-content">
								<h2>Récapitulatif</h2>
								<p className="tag-name">
									{advert.main_tag_name} & {advert.sub_tag_name}
								</p>
								<p className="goat-name">
									Cours donné par : {advert.goat_firstname}.
								</p>
								<p>{advert.description}</p>
								<p className="date">
									Date :{" "}
									{selectedSlot
										? new Date(selectedSlot.start_at).toLocaleString("fr-FR", {
												weekday: "long",
												day: "2-digit",
												month: "long",
												hour: "2-digit",
												minute: "2-digit",
											})
										: "Non sélectionnée"}
								</p>
								<p className="message">
									Mon message pour {advert.goat_firstname} (facultatif)
								</p>
								<input
									type="text"
									placeholder="Laisser un message ..."
									onChange={(e) => setMessage(e.target.value)}
									value={message}
								/>
								<div className="modal-buttons">
									<button type="button" onClick={handleConfirm}>
										Valider ma réservation
									</button>

									<button type="button" onClick={() => setIsModalOpen(false)}>
										Annuler
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default AdvertDetails;
