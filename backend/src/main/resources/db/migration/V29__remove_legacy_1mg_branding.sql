-- Normalize collection branding text across seeded test records
UPDATE tests
SET collection_subtext = 'Certified phlebotomists'
WHERE collection_text = 'Who will collect your samples?'
  AND collection_subtext IS NOT NULL
  AND collection_subtext <> 'Certified phlebotomists';
