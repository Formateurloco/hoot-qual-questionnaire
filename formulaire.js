/*
HOOT QUAL
Signaler • Analyser • Améliorer

Conception et développement :
FRIAS KEVIN

Création : 2026
Copyright © 2026 FRIAS KEVIN
Tous droits réservés.

Voir COPYRIGHT.txt.
*/
/* Aucune requête, aucun stockage des réponses : tout reste en mémoire. */
'use strict';
const byId = id => document.getElementById(id);
const form = byId('f');
const yesNo = ['Oui', 'Non', 'Je ne sais pas'];
const options = {
  qualite: ['Étudiant', 'Formateur', 'Personnel administratif', 'Intervenant extérieur', 'Autre'],
  localisation: ['IFSI', 'Hors IFSI'],
  categorie: ['Pédagogie / formation', 'Stage', 'Organisation', 'Communication / information', 'Locaux / environnement', 'Matériel / équipement', 'Informatique / numérique', 'Sécurité', 'Administration', 'Comportement / relationnel', 'Autre'],
  gravite: ['Faible', 'Modérée', 'Élevée', 'Critique'],
  evenement_connu: ['Déjà connu', 'Non connu', 'Je ne sais pas'],
  deja_signale: yesNo, risque_reapparition: yesNo, mesures_immediates: yesNo,
};
for (const [id, values] of Object.entries(options)) {
  byId(id).append(new Option('Sélectionnez une réponse', ''), ...values.map(v => new Option(v, v)));
}
const consequenceOptions = ['Aucune conséquence constatée', 'Perturbation de la formation', 'Retard / désorganisation', 'Impact matériel', 'Impact sur une ou plusieurs personnes', 'Risque identifié sans conséquence', 'Autre'];
for (const [i, value] of consequenceOptions.entries()) {
  const label = document.createElement('label'); label.className = 'check';
  const input = document.createElement('input'); input.type = 'checkbox'; input.name = 'consequences'; input.value = value; input.id = `consequence_${i}`;
  label.append(input, document.createTextNode(value)); byId('consequences').append(label);
}
const boxes = [...document.querySelectorAll('[name="consequences"]')];
const personneOptions = ['Directeur', 'Cadre de santé', 'Secrétaire', 'Intendant', 'Autre', 'Personne'];
for (const [i, value] of personneOptions.entries()) {
  const label = document.createElement('label'); label.className = 'check';
  const input = document.createElement('input'); input.type = 'checkbox'; input.name = 'personnes'; input.value = value; input.id = `personne_${i}`;
  label.append(input, document.createTextNode(value)); byId('personnes').append(label);
}
const personneBoxes = [...document.querySelectorAll('[name="personnes"]')];
function conditional(id, visible) {
  byId(id + '_zone').hidden = !visible;
  byId(id).disabled = !visible;
  byId(id).required = visible;
  if (!visible) { byId(id).value = ''; byId(id).setCustomValidity(''); }
}
function updateConditions() {
  conditional('personne_autre', personneBoxes[4].checked);
  personneBoxes[0].setCustomValidity(personneBoxes.some(b => b.checked) ? '' : 'Sélectionnez une personne prévenue ou « Personne ».');
  conditional('qualite_precision', byId('qualite').value === 'Autre');
  conditional('promotion', byId('qualite').value === 'Étudiant');
  conditional('categorie_precision', byId('categorie').value === 'Autre');
  conditional('deja_signale', byId('evenement_connu').value === 'Déjà connu');
  conditional('consequences_autre', boxes.at(-1).checked);
  conditional('mesures_description', byId('mesures_immediates').value === 'Oui');
  boxes[0].setCustomValidity(boxes.some(b => b.checked) ? '' : 'Sélectionnez au moins une conséquence.');
}
form.addEventListener('change', event => {
  if (event.target.name === 'consequences' && event.target.checked) {
    if (event.target === boxes[0]) boxes.slice(1).forEach(b => b.checked = false);
    else boxes[0].checked = false;
  }
  if (event.target.name === 'personnes' && event.target.checked) {
    if (event.target === personneBoxes[5]) personneBoxes.slice(0,5).forEach(b => b.checked = false);
    else personneBoxes[5].checked = false;
  }
  updateConditions();
});
form.addEventListener('input', event => event.target.setCustomValidity(''));
updateConditions();
const labels = {
  personnes:'Personne(s) prévenue(s)', personne_autre:'Autre personne prévenue',
  nom_declarant:'Nom et prénom', email_declarant:'Adresse mail', qualite:'Qualité', qualite_precision:'Précision qualité', promotion:'Promotion',
  date_evenement:'Date de l’événement', heure_evenement:'Heure', localisation:'Localisation', lieu_precision:'Lieu précis',
  categorie:'Catégorie', categorie_precision:'Précision catégorie', gravite:'Gravité perçue',
  evenement_connu:'Événement connu', deja_signale:'Déjà signalé', risque_reapparition:'Risque de réapparition',
  description:'Description factuelle', consequences:'Conséquences sélectionnées', consequences_autre:'Autre conséquence', consequences_precision:'Précisions concernant les conséquences',
  mesures_immediates:'Mesures prises immédiatement', mesures_description:'Description des mesures', proposition_declarant:'Proposition du déclarant',
};
const sections = [
  ['DÉCLARANT', ['nom_declarant','email_declarant','qualite','qualite_precision','promotion']],
  ['ÉVÉNEMENT', ['date_evenement','heure_evenement','localisation','lieu_precision']],
  ['CATÉGORIE', ['categorie','categorie_precision','gravite']],
  ['INDICATEURS DE MAÎTRISE', ['evenement_connu','deja_signale','risque_reapparition']],
  ['PERSONNE(S) PRÉVENUE(S)', ['personnes','personne_autre']],
  ['DESCRIPTION FACTUELLE', ['description']],
  ['CONSÉQUENCES', ['consequences','consequences_autre','consequences_precision']],
  ['MESURES IMMÉDIATES', ['mesures_immediates','mesures_description']],
  ['PROPOSITION DU DÉCLARANT', ['proposition_declarant']],
];
function collect() {
  const data = {};
  for (const key of Object.keys(labels)) data[key] = key === 'personnes' ? personneBoxes.filter(b => b.checked).map(b => b.value) : key === 'consequences' ? boxes.filter(b => b.checked).map(b => b.value) : (byId(key).disabled ? '' : byId(key).value.trim());
  return data;
}
function validate() {
  updateConditions();
  for (const control of form.querySelectorAll('input,textarea')) {
    if (control.required && !control.disabled && !control.value.trim()) control.setCustomValidity('Veuillez renseigner ce champ.');
  }
  return form.reportValidity();
}
let reviewed = null;
let generated = null;
function visibleKeys(keys, data) {
  return keys.filter(key => !['personne_autre','qualite_precision','promotion','categorie_precision','deja_signale','consequences_autre','mesures_description'].includes(key) || data[key]);
}
function showReview(data) {
  byId('review_content').replaceChildren();
  for (const [title, keys] of sections) {
    const section = document.createElement('section'); const heading = document.createElement('h3'); heading.textContent = title;
    const list = document.createElement('dl');
    for (const key of visibleKeys(keys, data)) {
      const term = document.createElement('dt'); term.textContent = labels[key];
      const value = document.createElement('dd'); value.textContent = Array.isArray(data[key]) ? data[key].join('\n') : data[key] || 'Non renseigné';
      list.append(term, value);
    }
    section.append(heading,list); byId('review_content').append(section);
  }
  form.hidden = true; byId('review').hidden = false; byId('review_title').focus(); window.scrollTo(0,0);
}
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!validate()) return;
  reviewed = collect(); generated = null; byId('msg').textContent = '';
  byId('transmission').hidden = true;
  showReview(reviewed);
});
byId('modify').addEventListener('click', () => {
  byId('transmission').hidden = true;
  byId('review').hidden = true; form.hidden = false; reviewed = null; generated = null;
  byId('nom_declarant').focus(); byId('msg').textContent = '';
});
function localTimestamp(now) {
  const pad = value => String(value).padStart(2,'0');
  const offset = -now.getTimezoneOffset();
  return `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}${offset >= 0 ? '+' : '-'}${pad(Math.floor(Math.abs(offset)/60))}:${pad(Math.abs(offset)%60)}`;
}
function technicalPayload(data) {
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return 'IFSI_EI_V3:' + btoa(binary);
}
function createPDF(data) {
  const {jsPDF} = window.jspdf;
  const doc = new jsPDF({compress:true});
  doc.addFileToVFS('DejaVuSans.ttf', window.EI_FONT);
  doc.addFont('DejaVuSans.ttf', 'EI', 'normal'); doc.setFont('EI');
  doc.setProperties({title:"FICHE DE DÉCLARATION D'UN ÉVÉNEMENT INDÉSIRABLE", subject:technicalPayload(data), creator:'Formulaire EI IFSI — V3'});
  doc.addImage(window.HOOT_LOGO_PDF, 'PNG', 18, 9, 36, 24);
  doc.setFontSize(15); doc.setTextColor(28,116,117); doc.text('HOOT QUAL',60,20);
  doc.setFontSize(9); doc.text('Signaler • Analyser • Améliorer',60,27);
  let y = 44;
  const page = () => { doc.addPage(); y = 23; doc.setFont('EI'); };
  const ensure = height => { if (y + height > 278) page(); };
  const text = (value, size=10, color=[32,54,74]) => {
    doc.setFontSize(size); doc.setTextColor(...color);
    // Écrire ligne par ligne pour ne jamais couper un texte long au bas d’une page.
    for (const line of doc.splitTextToSize(String(value || 'Non renseigné'), 170)) {
      ensure(size * .48); doc.text(line,20,y); y += size * .48;
    }
  };
  text("FICHE DE DÉCLARATION D'UN",16); text('ÉVÉNEMENT INDÉSIRABLE',16); y+=5;
  text('N° ' + data.id_ei,10); text('Date de déclaration : ' + data.date_declaration.replace('T',' '),9); y+=8;
  for (const [title, keys] of sections) {
    ensure(25); doc.setFillColor(231,241,247); doc.rect(18,y-5,174,9,'F');
    text(title,11); y+=6;
    for (const key of visibleKeys(keys,data)) {
      ensure(17); text(labels[key],9,[55,95,119]); y+=1;
      text(Array.isArray(data[key]) ? data[key].join(' ; ') : data[key],10); y+=5;
    }
    y+=4;
  }
  const pages = doc.getNumberOfPages();
  for (let i=1;i<=pages;i++) {
    doc.setPage(i); doc.setFont('EI'); doc.setFontSize(8); doc.setTextColor(90,110,125);
    doc.text(data.id_ei,20,288); doc.text(`${i} / ${pages}`,190,288,{align:'right'});
  }
  return doc;
}
// Une seule configuration, lue aussi par les liens et le menu de partage.
function destinationEmail() {
  const value = String(window.HOOT_CONFIG?.ADRESSE_EMAIL_DESTINATION || '').trim();
  return /^[^\s@<>?,;:]+@[^\s@<>?,;:]+\.[^\s@<>?,;:]+$/.test(value) ? value : '';
}
byId('destination').textContent = destinationEmail() || 'Adresse à configurer par l’IFSI avant diffusion du formulaire.';
function uniqueId(now) {
  // 24 caractères hexadécimaux : format reconnu par l’importeur V3 existant.
  const random = typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID().replace(/-/g,'').replace(/^(.{12}).(.{3})./, '$1$2').slice(0,24)
    : [...crypto.getRandomValues(new Uint8Array(12))].map(v=>v.toString(16).padStart(2,'0')).join('');
  return `EI-${now.getFullYear()}-${random.toUpperCase()}`;
}
// Texte du mail en ASCII, encodé une seule fois dans le lien final.
function messageText(id) {
  return `Bonjour,\n\nVeuillez trouver ci-joint ma declaration d'evenement indesirable Hoot Qual numero ${id}.\n\nPensez a joindre le fichier PDF Hoot Qual que vous venez de telecharger a ce message.\n\nCordialement.`;
}
function buildMailto(email, subject, body) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
function mailUrl() {
  const email = destinationEmail();
  const subject = `Declaration EI Hoot Qual - ${generated.id}`;
  const body = messageText(generated.id);
  return buildMailto(email, subject, body);
}
function openMail(url) { window.location.href = url; }
byId('mail').addEventListener('click', () => {
  if (generated?.downloaded) openMail(mailUrl());
});
byId('download').addEventListener('click', async () => {
  if (!generated || !reviewed) return;
  const button = byId('download'); button.disabled = true;
  try {
    if (!generated.doc) generated.doc = createPDF(generated.data);
    // La promesse confirme le déclenchement, pas l’écriture finale sur le téléphone.
    await generated.doc.save(`HootQual_${generated.id}.pdf`, {returnPromise:true});
    generated.downloaded = true;
    byId('download-status').textContent = '✓ Téléchargement lancé. Vérifiez que le PDF est enregistré dans les téléchargements de votre appareil.';
    byId('send-step').disabled = false;
    byId('msg').textContent = '';
  } catch (_) {
    byId('msg').textContent = 'Le téléchargement n’a pas pu être lancé. Réessayez « Télécharger mon PDF ».';
  } finally { button.disabled = false; }
});
byId('generate').addEventListener('click', () => {
  if (!reviewed) return;
  if (!form.checkValidity() || JSON.stringify(collect()) !== JSON.stringify(reviewed)) {
    byId('modify').click(); validate(); return;
  }
  if (!destinationEmail()) {
    byId('msg').textContent = 'L’IFSI doit configurer l’adresse de réception avant de diffuser ce questionnaire.';
    return;
  }
  if (!generated) {
    const now = new Date();
    const data = {version:3,id_ei:uniqueId(now),date_declaration:localTimestamp(now),...reviewed};
    generated = {id:data.id_ei,data,doc:null,downloaded:false};
    byId('download-status').textContent = '';
  }
  byId('ready-id').textContent = generated.id;
  byId('recipient').textContent = destinationEmail();
  byId('send-step').disabled = !generated.downloaded;
  byId('review').hidden = true;
  byId('transmission').hidden = false;
  byId('msg').textContent = '';
  byId('ready-title').focus();
  byId('transmission').scrollIntoView({block:'start'});
});
byId('back-review').addEventListener('click', () => {
  byId('transmission').hidden = true;
  showReview(reviewed);
});
