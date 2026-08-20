"use client";

import { Plus, X } from "lucide-react";
import { FormEvent } from "react";
import type { Section } from "./types";

export const moduleConfig: Record<string, { description: string; emptyTitle: string; emptyText: string; addLabel: string; fieldLabel: string; placeholder: string }> = {
  Calendrier: { description: "Visualisez les disponibilités et événements de vos salles.", emptyTitle: "Votre calendrier est libre", emptyText: "Les réservations et événements apparaîtront ici dès leur création.", addLabel: "Créer un événement", fieldLabel: "Nom de l’événement", placeholder: "Ex. Mariage de Sophie et Marc" },
  Salles: { description: "Centralisez vos espaces d'exception, capacités, tarifs saisonniers et équipements.", emptyTitle: "Aucune salle enregistrée", emptyText: "Ajoutez votre première salle pour commencer à organiser vos réceptions.", addLabel: "Ajouter une salle", fieldLabel: "Nom de la salle", placeholder: "Ex. Le Jardin d’Opale" },
  Réservations: { description: "Suivez les demandes, événements, acomptes et confirmations.", emptyTitle: "Aucune réservation", emptyText: "Les nouvelles demandes de réservation seront centralisées dans cet espace.", addLabel: "Nouvelle réservation", fieldLabel: "Nom du client ou événement", placeholder: "Ex. Mariage de Sophie et Marc" },
  Clients: { description: "Conservez une vue complète de vos clients particuliers et entreprises.", emptyTitle: "Votre carnet client est vide", emptyText: "Ajoutez un client pour suivre ses coordonnées, préférences et historique.", addLabel: "Ajouter un client", fieldLabel: "Nom complet", placeholder: "Ex. Sophie Martin" },
  Services: { description: "Gérez vos prestations complémentaires : traiteur, décoration, régie DJ ou sécurité.", emptyTitle: "Aucun service configuré", emptyText: "Créez vos prestations pour enrichir l'offre de vos événements.", addLabel: "Ajouter un service", fieldLabel: "Nom du service", placeholder: "Ex. Décoration florale prestige" },
  Paiements: { description: "Suivez les acomptes, soldes et transactions en temps réel.", emptyTitle: "Aucun paiement enregistré", emptyText: "Les paiements associés à vos réservations apparaîtront ici.", addLabel: "Enregistrer un paiement", fieldLabel: "Référence du paiement", placeholder: "Ex. Acompte réservation #001" },
  Contrats: { description: "Préparez, envoyez et suivez les contrats de mise à disposition.", emptyTitle: "Aucun contrat", emptyText: "Créez un contrat pour sécuriser vos réceptions.", addLabel: "Créer un contrat", fieldLabel: "Nom du contrat", placeholder: "Ex. Contrat mariage Martin" },
  Employés: { description: "Coordonnez votre équipe et définissez les rôles et accès.", emptyTitle: "Aucun collaborateur ajouté", emptyText: "Ajoutez les membres de votre équipe pour orchestrer vos événements.", addLabel: "Ajouter un collaborateur", fieldLabel: "Nom du collaborateur", placeholder: "Ex. Léa Bernard" },
  Rapports: { description: "Analysez la performance financière et le taux d'occupation.", emptyTitle: "Aucun rapport généré", emptyText: "Générez votre premier rapport pour suivre la performance de votre activité.", addLabel: "Générer un rapport", fieldLabel: "Nom du rapport", placeholder: "Ex. Rapport mensuel" },
  Notifications: { description: "Retrouvez vos alertes, rappels et mises à jour importantes.", emptyTitle: "Tout est calme", emptyText: "Vous n’avez aucune notification à traiter pour le moment.", addLabel: "Créer une note", fieldLabel: "Message", placeholder: "Ex. Rappeler le traiteur" },
  Paramètres: { description: "Configurez votre établissement, devise et préférences.", emptyTitle: "Configuration", emptyText: "Ajustez vos paramètres d'exploitation.", addLabel: "Ajouter un réglage", fieldLabel: "Nom du réglage", placeholder: "Ex. Devise par défaut" },
};

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
      <select name={name} defaultValue={defaultValue ?? options[0]} required={required}>
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

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form
        className={`record-modal professional-modal ${isReservation || active === "Salles" ? "wide-modal" : ""}`}
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

        {active === "Salles" && (
          <>
            <div className="form-section">
              <h3>Caractéristiques du lieu</h3>
              <div className="form-grid">
                <Field label="Nom de la salle" name="name" placeholder="Ex. Le Jardin d’Opale" required />
                <Field label="Capacité maximale (personnes)" name="capacity" type="number" placeholder="250" min="1" required />
                <Field label="Adresse" name="address" placeholder="12 route des Châteaux" />
                <Field label="Ville" name="city" placeholder="Chantilly" />
                <Field label="Code postal" name="postalCode" placeholder="60500" />
                <Field label="Pays" name="country" placeholder="France" defaultValue="France" />
              </div>
            </div>
            <div className="form-section">
              <h3>Tarification (€)</h3>
              <div className="form-grid">
                <Field label="Tarif standard (€)" name="price" type="number" min="0" step="0.01" placeholder="2500" required />
                <Field label="Basse saison (€)" name="lowSeasonPrice" type="number" min="0" step="0.01" placeholder="1800" />
                <Field label="Haute saison (€)" name="highSeasonPrice" type="number" min="0" step="0.01" placeholder="3200" />
                <SelectField label="Statut d'exploitation" name="status" options={["active", "inactive"]} />
              </div>
            </div>
          </>
        )}

        {active === "Clients" && (
          <>
            <div className="form-section">
              <h3>Identité & Coordonnées</h3>
              <div className="form-grid">
                <Field label="Nom complet / Contact" name="name" placeholder="Sophie Martin" required />
                <Field label="Numéro de téléphone" name="phone" placeholder="06 12 34 56 78" required />
                <Field label="Adresse email" name="email" type="email" placeholder="sophie.martin@email.com" />
                <Field label="Entreprise / Organisation" name="company" placeholder="Société Martin & Associés" />
                <Field label="Ville" name="city" placeholder="Paris" />
                <Field label="Pays" name="country" placeholder="France" defaultValue="France" />
              </div>
            </div>
            <div className="form-section">
              <h3>Profil & Origine</h3>
              <div className="form-grid">
                <SelectField label="Type de client" name="clientType" options={["Particulier", "Entreprise", "Agence événementielle"]} />
                <Field label="Canal d'acquisition" name="source" placeholder="Site web, Bouche-à-oreille, Instagram..." />
              </div>
            </div>
          </>
        )}

        {active === "Employés" && (
          <>
            <div className="form-section">
              <h3>Collaborateur & Permissions</h3>
              <div className="form-grid">
                <Field label="Nom complet" name="name" placeholder="Léa Bernard" required />
                <Field label="Email professionnel" name="email" type="email" placeholder="lea.bernard@venoria.fr" required />
                <Field label="Téléphone de contact" name="phone" placeholder="06 98 76 54 32" />
                <SelectField label="Rôle d'accès" name="role" options={["MANAGER", "ADMIN", "EMPLOYEE", "OWNER"]} required />
              </div>
            </div>
          </>
        )}

        {active === "Services" && (
          <>
            <div className="form-section">
              <h3>Prestation & Tarification</h3>
              <div className="form-grid">
                <Field label="Nom du service" name="name" placeholder="Décoration florale sur-mesure" required />
                <Field label="Catégorie" name="category" placeholder="Décoration, Traiteur, Régie son..." required />
                <Field label="Fournisseur / Prestataire" name="provider" placeholder="Atelier Végétal" />
                <Field label="Téléphone prestataire" name="providerPhone" placeholder="01 40 00 00 00" />
                <Field label="Email prestataire" name="providerEmail" type="email" placeholder="contact@prestataire.fr" />
                <Field label="Tarif HT (€)" name="price" type="number" min="0" step="0.01" placeholder="850" required />
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
                <Field label="Montant total convenu (€)" name="total" type="number" min="0" step="0.01" placeholder="6500" required />
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
                <Field label="Montant (€)" name="amount" type="number" min="0.01" step="0.01" placeholder="1500" required />
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

        {!["Salles", "Clients", "Employés", "Services", "Réservations", "Paiements", "Contrats"].includes(active) && (
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
