const baseUrl = process.env.REACT_APP_COUNTER_API_URL;

export async function getCounterData() {
  const response = await fetch(`${baseUrl}/old`);
  const body = await response.json();

  if (response.status !== 200) {
    throw Error(body.message);
  }
  return body;
}

export async function getCounterById(id, opts) {
  const response = await fetch(`${baseUrl}/${id}`, opts);
  const body = await response.json();

  if (response.status !== 200) {
    throw Error(body.message);
  }
  return body;
}

export async function addCounter(counter) {
  const response = await fetch(`${baseUrl}`, {
    method: 'POST',
    headers: {
      'Content-Type': ['application/json'],
    },
    body: JSON.stringify(counter),
  });

  if (response.status !== 200) {
    throw Error(response.body.message);
  }

  return 'ok';
}

export async function updateCounter(counter) {
  const response = await fetch(`${baseUrl}/${counter.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': ['application/json'],
    },
    body: JSON.stringify(counter),
  });
  const body = await response.text();

  if (response.status !== 200) {
    throw Error(body);
  }

  return 'ok';
}

export async function importCounterData() {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/api/import/counters`);

  if (response.status !== 200) {
    throw Error(response.body.message);
  }

  return 'ok';
}

export async function getCounterStubsBySquadId(squadId, view, type, opts) {
  const url = new URL(`${baseUrl}/getStubsBySquadId/${squadId}`);
  url.searchParams.set('view', view);
  url.searchParams.set('type', type);

  const response = await fetch(url, opts);
  const body = await response.json();

  if (response.status !== 200) {
    throw Error(body.message);
  }
  return body;
}
