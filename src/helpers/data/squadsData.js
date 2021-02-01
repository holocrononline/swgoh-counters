import firebase from 'firebase/app';
import 'firebase/auth';

const baseUrl = process.env.REACT_APP_SQUAD_API_URL;

export async function getSquadData() {
  try {
    const response = await fetch(`${baseUrl}`);
    return await response.json();
  } catch (err) {
    console.error(err);
    return '';
  }
}

export async function addSquad(squad) {
  const token = await firebase.auth().currentUser.getIdToken(true);
  try {
    const response = await fetch(`${baseUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(squad),
    });
    const body = await response.json();
    return { status: 'ok', squadId: body };
  } catch (err) {
    throw new Error(err);
  }
}

export async function updateSquad(squad) {
  const token = await firebase.auth().currentUser.getIdToken(true);
  try {
    await fetch(`${baseUrl}/${squad.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(squad),
    });
    return 'ok';
  } catch (err) {
    throw new Error(err);
  }
}


export async function getSquadStubs(size, opts) {
  const response = await fetch(`${baseUrl}/stubs/${size}`, opts);
  const body = await response.json();

  if (!response.ok) {
    throw Error(body);
  }

  return body;
}

export async function getSquadVersionDate() {
  try {
    const response = await fetch(`${baseUrl}/versionDate`);
    return await response.json();
  } catch (err) {
    throw new Error(err);
  }
}

export async function getOldSquadData() {
  try {
    const response = await fetch(`${baseUrl}/old`);
    return await response.json();
  } catch (err) {
    throw new Error(err);
  }
}

export async function importSquadData() {
  try {
    await fetch(`${process.env.REACT_APP_API_URL}/api/import/squads`);
    return 'ok';
  } catch (err) {
    throw new Error(err);
  }
}
