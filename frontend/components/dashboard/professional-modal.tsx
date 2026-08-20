"use client";

import { Image as ImageIcon, Plus, Sparkles, Trash2, UploadCloud, X } from "lucide-react";
import { ChangeEvent, DragEvent, FormEvent, useState } from "react";
import type { Section } from "./types";

export const moduleConfig: Record<string, { description: string; emptyTitle: string; emptyText: string; addLabel: string; fieldLabel: string; placeholder: string }> = {
  Calendrier: { description: "Visualisez les disponibilités et événements de vos salles.", emptyTitle: "Votre calendrier est libre", emptyText: "Les réservations et événements apparaîtront ici dès leur création.", addLabel: "Créer un événement", fieldLabel: "Nom de l’événement", placeholder: "Ex. Mariage de Sophie et Marc" },
  Salles: { description: "Centralisez vos espaces d'exception, capacités, tarifs saisonniers, photos et équipements.", emptyTitle: "Aucune salle enregistrée", emptyText: "Ajoutez votre première salle pour commencer à organiser vos réceptions.", addLabel: "Ajouter une salle", fieldLabel: "Nom de la salle", placeholder: "Ex. Le Jardin d’Opale" },
  Réservations: { description: "Suivez les demandes, événements, acomptes et confirmations.", emptyTitle: "Aucune réservation", emptyText: "Les nouvelles demandes de réservation seront centralisées dans cet espace.", addLabel: "Nouvelle réservation", fieldLabel: "Nom du client ou événement", placeholder: "Ex. Mariage de Sophie et Marc" },
  Clients: { description: "Conservez une vue complète de vos clients particuliers et entreprises.", emptyTitle: "Votre carnet client est vide", emptyText: "Ajoutez un client pour suivre ses coordonnées, préférences et historique.", addLabel: "Ajouter un client", fieldLabel: "Nom complet", placeholder: "Ex. Sophie Martin" },
  Services: { description: "Gérez vos prestations complémentaires : traiteur, décoration, régie DJ ou sécurité.", emptyTitle: "Aucun service configuré", emptyText: "Créez vos prestations pour enrichir l'offre de vos événements.", addLabel: "Ajouter un service", fieldLabel: "Nom du service", placeholder: "Ex. Décoration florale prestige" },
  Paiements: { description: "Suivez les acomptes, soldes et transactions en temps réel.", emptyTitle: "Aucun paiement enregistré", emptyText: "Les paiements associés à vos réservations apparaîtront ici.", addLabel: "Enregistrer un paiement", fieldLabel: "Référence du paiement", placeholder: "Ex. Acompte réservation #001" },
  Contrats: { description: "Préparez, envoyez et suivez les contrats de mise à disposition.", emptyTitle: "Aucun contrat", emptyText: "Créez un contrat pour sécuriser vos réceptions.", addLabel: "Créer un contrat", fieldLabel: "Nom du contrat", placeholder: "Ex. Contrat mariage Martin" },
  Abonnement: { description: "Gérez votre formule, options de facturation et accès VIP.", emptyTitle: "Abonnement Actif", emptyText: "Votre compte bénéficie de la formule VENORIA Prestige.", addLabel: "Modifier mon forfait", fieldLabel: "Formule", placeholder: "VENORIA Prestige" },
  Rapports: { description: "Analysez la performance financière et le taux d'occupation.", emptyTitle: "Aucun rapport généré", emptyText: "Générez votre premier rapport pour suivre la performance de votre activité.", addLabel: "Générer un rapport", fieldLabel: "Nom du rapport", placeholder: "Ex. Rapport mensuel" },
  Notifications: { description: "Retrouvez vos alertes, rappels et mises à jour importantes.", emptyTitle: "Tout est calme", emptyText: "Vous n’avez aucune notification à traiter pour le moment.", addLabel: "Créer une note", fieldLabel: "Message", placeholder: "Ex. Rappeler le traiteur" },
  Paramètres: { description: "Configurez votre établissement, devise et préférences.", emptyTitle: "Configuration", emptyText: "Ajustez vos paramètres d'exploitation.", addLabel: "Ajouter un réglage", fieldLabel: "Nom du réglage", placeholder: "Ex. Devise par défaut" },
};

const PRESET_HALLS = [
  {
    name: "Le Château Royal de Venoria",
    capacity: "350",
    city: "Chantilly",
    address: "14 allée des Châteaux",
    price: "4500",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop&q=80",
    desc: "Parc boisé, grand salon d'honneur et lustres en cristal.",
  },
  {
    name: "L'Orangerie Impériale & Verrière",
    capacity: "220",
    city: "Versailles",
    address: "2 place du Grand Trianon",
    price: "3800",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80",
    desc: "Verrière monumentale et jardin à la française.",
  },
  {
    name: "Le Pavillon de Cristal",
    capacity: "180",
    city: "Cannes",
    address: "Boulevard de la Croisette",
    price: "5200",
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&auto=format&fit=crop&q=80",
    desc: "Vue panoramique sur mer et architecture contemporaine.",
  },
  {
    name: "Le Rooftop Émeraude & Baie",
    capacity: "140",
    city: "Nice",
    address: "Promenade des Anglais",
    price: "3200",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80",
    desc: "Espace à ciel ouvert pour réceptions d'exception.",
  },
];

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
  min,
  step,
  minLength,
  defaultValue,
  value,
  onChange,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  min?: string;
  step?: string;
  minLength?: number;
  defaultValue?: string;
  value?: string | number;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label>
      {label}
      {required && " *"}
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        min={min}
        step={step}
        minLength={minLength}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  options: string[];
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label>
      {label}
      {required && " *"}
      <select name={name} required={required} defaultValue={defaultValue}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

interface ProfessionalModalProps {
  active: Section;
  error: string;
  saving: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function ProfessionalModal({ active, error, saving, onClose, onSubmit }: ProfessionalModalProps) {
  const title = moduleConfig[active]?.addLabel ?? "Ajouter un élément";
  const isPayment = active === "Paiements";
  const isReservation = active === "Réservations";
  const isHall = active === "Salles";

  const [hallTab, setHallTab] = useState<"form" | "presets">("form");
  const [hallImage, setHallImage] = useState<string>("");
  const [hallName, setHallName] = useState<string>("");
  const [hallCapacity, setHallCapacity] = useState<string>("");
  const [hallCity, setHallCity] = useState<string>("");
  const [hallAddress, setHallAddress] = useState<string>("");
  const [hallPrice, setHallPrice] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setHallImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function applyPreset(preset: typeof PRESET_HALLS[0]) {
    setHallName(preset.name);
    setHallCapacity(preset.capacity);
    setHallCity(preset.city);
    setHallAddress(preset.address);
    setHallPrice(preset.price);
    setHallImage(preset.image);
    setHallTab("form");
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form
        className={`record-modal professional-modal ${isReservation || isHall ? "wide-modal" : ""}`}
        onSubmit={onSubmit}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Fermer">
          <X size={18} />
        </button>
        <div className="eyebrow">
          <Plus size={15} /> {title.toUpperCase()}
        </div>
        <h2>{title}</h2>
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        {isHall && (
          <div className="import-tab-bar">
            <button
              type="button"
              className={`import-tab-btn ${hallTab === "form" ? "active" : ""}`}
              onClick={() => setHallTab("form")}
            >
              Formulaire &amp; Photo
            </button>
            <button
              type="button"
              className={`import-tab-btn ${hallTab === "presets" ? "active" : ""}`}
              onClick={() => setHallTab("presets")}
            >
              <Sparkles size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
              Modèles &amp; Import Prestige
            </button>
          </div>
        )}

        {isHall && hallTab === "presets" && (
          <div className="form-section">
            <h3>Salles d&apos;exception prêtes à l&apos;importation</h3>
            <p style={{ fontSize: "12px", opacity: 0.8, margin: "0 0 12px 0" }}>
              Sélectionnez une salle pour pré-remplir instantanément sa fiche avec sa photo haute définition.
            </p>
            <div className="import-presets-grid">
              {PRESET_HALLS.map((preset) => (
                <button
                  type="button"
                  key={preset.name}
                  className="import-preset-card"
                  onClick={() => applyPreset(preset)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preset.image} alt={preset.name} />
                  <div className="import-preset-body">
                    <strong>{preset.name}</strong>
                    <span>{preset.capacity} pers. · {preset.city} · ${Number(preset.price).toLocaleString()}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {isHall && hallTab === "form" && (
          <>
            <div className="form-section">
              <h3>Photo &amp; Visuel de la salle</h3>
              <input type="hidden" name="image" value={hallImage} />
              {hallImage ? (
                <div className="image-preview-container">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={hallImage} alt="Aperçu de la salle" />
                  <button
                    type="button"
                    className="image-preview-remove"
                    onClick={() => setHallImage("")}
                    aria-label="Supprimer la photo"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ) : (
                <div
                  className={`image-upload-zone ${isDragging ? "dragging" : ""}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    onChange={handleFileChange}
                  />
                  <div className="upload-icon">
                    <UploadCloud size={30} />
                  </div>
                  <p>
                    <strong>Glissez une photo de la salle</strong> ou cliquez pour parcourir
                  </p>
                  <small>Formats acceptés : PNG, JPG, WebP (Haute résolution)</small>
                </div>
              )}
            </div>

            <div className="form-section">
              <h3>Caractéristiques du lieu</h3>
              <div className="form-grid">
                <Field
                  label="Nom de la salle"
                  name="name"
                  placeholder="Ex. Le Jardin d’Opale"
                  value={hallName}
                  onChange={(e) => setHallName(e.target.value)}
                  required
                />
                <Field
                  label="Capacité maximale (personnes)"
                  name="capacity"
                  type="number"
                  placeholder="250"
                  min="1"
                  value={hallCapacity}
                  onChange={(e) => setHallCapacity(e.target.value)}
                  required
                />
                <Field
                  label="Adresse"
                  name="address"
                  placeholder="12 route des Châteaux"
                  value={hallAddress}
                  onChange={(e) => setHallAddress(e.target.value)}
                />
                <Field
                  label="Ville"
                  name="city"
                  placeholder="Chantilly"
                  value={hallCity}
                  onChange={(e) => setHallCity(e.target.value)}
                />
                <Field label="Code postal" name="postalCode" placeholder="60500" />
                <Field label="Pays" name="country" placeholder="France" defaultValue="France" />
              </div>
            </div>
            <div className="form-section">
              <h3>Tarification ($)</h3>
              <div className="form-grid">
                <Field
                  label="Tarif standard ($)"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="2500"
                  value={hallPrice}
                  onChange={(e) => setHallPrice(e.target.value)}
                  required
                />
                <Field label="Basse saison ($)" name="lowSeasonPrice" type="number" min="0" step="0.01" placeholder="1800" />
                <Field label="Haute saison ($)" name="highSeasonPrice" type="number" min="0" step="0.01" placeholder="3200" />
                <SelectField label="Statut d'exploitation" name="status" options={["active", "inactive"]} />
              </div>
            </div>
          </>
        )}

        {active === "Clients" && (
          <>
            <div className="form-section">
              <h3>Identité &amp; Coordonnées</h3>
              <div className="form-grid">
                <Field label="Nom complet du client" name="name" placeholder="Ex. Sophie & Marc Martin" required />
                <Field label="Adresse e-mail" name="email" type="email" placeholder="client@domaine.fr" required />
                <Field label="Numéro de téléphone" name="phone" placeholder="06 12 34 56 78" required />
                <Field label="Entreprise / Société" name="company" placeholder="Entreprise Martin SAS ou Particulier" />
                <Field label="Adresse postale" name="address" placeholder="10 avenue Foch" />
                <Field label="Ville" name="city" placeholder="Paris" />
                <SelectField label="Type de client" name="clientType" options={["Particulier", "Entreprise", "Agence", "Autre"]} />
                <SelectField label="Statut du compte" name="status" options={["active", "inactive"]} />
              </div>
            </div>
          </>
        )}

        {active === "Services" && (
          <>
            <div className="form-section">
              <h3>Prestation &amp; Tarification</h3>
              <div className="form-grid">
                <Field label="Nom du service" name="name" placeholder="Décoration florale sur-mesure" required />
                <Field label="Catégorie" name="category" placeholder="Décoration, Traiteur, Régie son..." required />
                <Field label="Fournisseur / Prestataire" name="provider" placeholder="Atelier Végétal" />
                <Field label="Téléphone prestataire" name="providerPhone" placeholder="01 40 00 00 00" />
                <Field label="Email prestataire" name="providerEmail" type="email" placeholder="contact@prestataire.fr" />
                <Field label="Tarif HT ($)" name="price" type="number" min="0" step="0.01" placeholder="850" required />
                <SelectField label="Type de facturation" name="priceType" options={["Forfait", "Par invité", "Par heure", "Personnalisé"]} />
              </div>
            </div>
          </>
        )}

        {isReservation && (
          <>
            <div className="form-section">
              <h3>Détails de l&apos;événement</h3>
              <div className="form-grid">
                <Field label="Nom de l’événement ou du client" name="name" placeholder="Mariage Sophie & Marc" required />
                <SelectField label="Type d'événement" name="eventType" options={["Mariage", "Fiançailles", "Gala & Entreprise", "Anniversaire", "Séminaire", "Autre"]} />
                <Field label="Date de l’événement" name="date" type="date" required />
                <Field label="Heure de début" name="startTime" type="time" defaultValue="14:00" required />
                <Field label="Heure de fin" name="endTime" type="time" defaultValue="02:00" required />
                <Field label="Nombre d’invités estimé" name="guests" type="number" min="1" placeholder="150" required />
                <Field label="Montant total convenu ($)" name="total" type="number" min="0" step="0.01" placeholder="6500" required />
              </div>
            </div>
          </>
        )}

        {isPayment && (
          <>
            <div className="form-section">
              <h3>Détails de l&apos;encaissement</h3>
              <div className="form-grid">
                <Field label="Référence ou Libellé" name="reference" placeholder="Acompte réservation #001" required />
                <Field label="Montant ($)" name="amount" type="number" min="0.01" step="0.01" placeholder="1500" required />
                <Field label="Date d'encaissement" name="date" type="date" required />
                <SelectField label="Moyen de paiement" name="method" options={["Virement bancaire", "Carte bancaire", "Espèces", "Chèque", "Autre"]} required />
              </div>
              <Field label="Notes / Justificatif" name="notes" placeholder="Remarques complémentaires..." />
            </div>
          </>
        )}

        {active === "Contrats" && (
          <>
            <div className="form-section">
              <h3>Informations Contractuelles</h3>
              <div className="form-grid">
                <Field label="Titre du contrat" name="name" placeholder="Contrat de mise à disposition - Mariage Martin" required />
                <Field label="Numéro de contrat" name="contractNumber" placeholder="CTR-2026-001" />
                <Field label="Date d'effet (début)" name="startDate" type="date" />
                <Field label="Date d'échéance (fin)" name="endDate" type="date" />
                <SelectField label="Statut initial" name="status" options={["draft", "sent", "signed"]} />
              </div>
            </div>
          </>
        )}

        {!["Salles", "Clients", "Abonnement", "Services", "Réservations", "Paiements", "Contrats"].includes(active) && (
          <div className="form-section">
            <div className="form-grid">
              <Field label={moduleConfig[active]?.fieldLabel ?? "Titre"} name="name" placeholder={moduleConfig[active]?.placeholder ?? "Nom de l'élément"} required />
            </div>
          </div>
        )}

        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose} disabled={saving}>
            Annuler
          </button>
          <button className="primary-button" type="submit" disabled={saving}>
            {saving && <span className="spinner" />}
            {saving ? "Enregistrement en cours..." : isPayment ? "Valider le paiement" : title}
          </button>
        </div>
      </form>
    </div>
  );
}
