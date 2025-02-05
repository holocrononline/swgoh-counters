SELECT
	s.id,
	sv.name,
	sv.toon1Id,
	char1.name as 'toon1Name',
	sv.toon2Id,
	char2.name as 'toon2Name',
	sv.toon3Id,
	char3.name as 'toon3Name',
	sv.toon4Id,
	char4.name as 'toon4Name',
	sv.toon5Id,
	char5.name as 'toon5Name',
	sv.description,
	sv.generalStrategy,
	s.latestVersionId,
	sv.createdOn,
	sv.createdById,
	sv.createdByName
FROM squad s
JOIN squadVersion sv ON sv.id = s.latestVersionId
JOIN `character` char1 ON char1.id = sv.toon1Id
JOIN `character` char2 ON char2.id = sv.toon2Id
JOIN `character` char3 ON char3.id = sv.toon3Id
JOIN `character` char4 ON char4.id = sv.toon4Id
JOIN `character` char5 ON char5.id = sv.toon5Id
WHERE toon1Id = ?
AND toon2Id = ?
AND toon3Id = ?
AND toon4Id = ?
AND toon5Id = ?;
