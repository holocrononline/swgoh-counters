SELECT
	c.id,
	c.opponentSquadId,
	c.counterSquadId,
	c.latestVersionId,
	cv.isHardCounter,
	cv.battleType,
	cv.counterStrategy,
  cv.isToon2Req,
  cv.isToon3Req,
  cv.isToon4Req,
  cv.isToon5Req,
  cv.toon1Zetas,
  cv.toon2Zetas,
  cv.toon3Zetas,
  cv.toon4Zetas,
  cv.toon5Zetas,
	cv.createdOn,
	cv.createdById,
  cv.createdByName
FROM counter c
JOIN counterVersion cv
  ON cv.id = c.latestVersionId 
WHERE c.counterSquadId = ?;