-- =============================================================================
-- Weedzilla Seed Data
-- Australian Environmental Weeds for Bush Regeneration
-- Reference: NSW WeedWise list, Australian Plant Census, PlantNET
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. SPECIES
-- 100+ species covering vines/scramblers, trees/shrubs, aquatic weeds,
-- grasses/sedges, herbaceous weeds, and succulents/cacti
-- -----------------------------------------------------------------------------

INSERT INTO public.species (scientific_name, common_names, family, status) VALUES

-- ===== VINES / SCRAMBLERS =====
('Lantana camara', ARRAY['Lantana', 'Common lantana'], 'Verbenaceae', 'approved'),
('Ipomoea cairica', ARRAY['Coastal morning glory', 'Mile-a-minute'], 'Convolvulaceae', 'approved'),
('Ipomoea indica', ARRAY['Blue morning glory', 'Purple morning glory'], 'Convolvulaceae', 'approved'),
('Anredera cordifolia', ARRAY['Madeira vine', 'Lamb''s tail'], 'Basellaceae', 'approved'),
('Araujia sericifera', ARRAY['Moth vine', 'White bladder flower', 'Cruel vine'], 'Apocynaceae', 'approved'),
('Cardiospermum grandiflorum', ARRAY['Balloon vine', 'Heart seed vine'], 'Sapindaceae', 'approved'),
('Delairea odorata', ARRAY['Cape ivy', 'German ivy'], 'Asteraceae', 'approved'),
('Asparagus aethiopicus', ARRAY['Asparagus fern', 'Ground asparagus'], 'Asparagaceae', 'approved'),
('Tradescantia fluminensis', ARRAY['Wandering trad', 'Wandering Jew'], 'Commelinaceae', 'approved'),
('Acetosa sagittata', ARRAY['Turkey rhubarb', 'Rambling dock'], 'Polygonaceae', 'approved'),
('Dolichandra unguis-cati', ARRAY['Cat''s claw creeper', 'Yellow trumpet vine'], 'Bignoniaceae', 'approved'),
('Asparagus asparagoides', ARRAY['Bridal creeper', 'Bridal veil', 'Smilax'], 'Asparagaceae', 'approved'),
('Thunbergia alata', ARRAY['Black-eyed Susan', 'Black-eyed Susan vine'], 'Acanthaceae', 'approved'),
('Thunbergia grandiflora', ARRAY['Blue trumpet vine', 'Sky vine', 'Bengal clock vine'], 'Acanthaceae', 'approved'),
('Passiflora suberosa', ARRAY['Corky passionfruit', 'Cork bark passion vine'], 'Passifloraceae', 'approved'),
('Passiflora subpeltata', ARRAY['White passionflower'], 'Passifloraceae', 'approved'),
('Solanum seaforthianum', ARRAY['Brazilian nightshade', 'Climbing nightshade'], 'Solanaceae', 'approved'),
('Ipomoea purpurea', ARRAY['Common morning glory'], 'Convolvulaceae', 'approved'),
('Jasminum polyanthum', ARRAY['White jasmine', 'Pink jasmine'], 'Oleaceae', 'approved'),
('Lonicera japonica', ARRAY['Japanese honeysuckle'], 'Caprifoliaceae', 'approved'),
('Cestrum parqui', ARRAY['Green cestrum', 'Chilean cestrum'], 'Solanaceae', 'approved'),
('Rubus fruticosus agg.', ARRAY['Blackberry', 'European blackberry'], 'Rosaceae', 'approved'),
('Asparagus africanus', ARRAY['Climbing asparagus fern'], 'Asparagaceae', 'approved'),
('Asparagus plumosus', ARRAY['Climbing asparagus fern', 'Ferny asparagus'], 'Asparagaceae', 'approved'),
('Wisteria sinensis', ARRAY['Chinese wisteria'], 'Fabaceae', 'approved'),
('Pandorea jasminoides', ARRAY['Bower vine'], 'Bignoniaceae', 'approved'),

-- ===== TREES / SHRUBS =====
('Ligustrum sinense', ARRAY['Small-leaved privet', 'Chinese privet'], 'Oleaceae', 'approved'),
('Ligustrum lucidum', ARRAY['Large-leaved privet', 'Broad-leaf privet', 'Glossy privet'], 'Oleaceae', 'approved'),
('Cinnamomum camphora', ARRAY['Camphor laurel'], 'Lauraceae', 'approved'),
('Olea europaea subsp. cuspidata', ARRAY['African olive'], 'Oleaceae', 'approved'),
('Ochna serrulata', ARRAY['Mickey Mouse plant', 'Ochna', 'Carnival bush'], 'Ochnaceae', 'approved'),
('Senna pendula', ARRAY['Senna', 'Cassia', 'Easter cassia'], 'Fabaceae', 'approved'),
('Erythrina crista-galli', ARRAY['Cockspur coral tree', 'Coral tree'], 'Fabaceae', 'approved'),
('Solanum mauritianum', ARRAY['Wild tobacco bush', 'Wild tobacco tree', 'Tobacco bush'], 'Solanaceae', 'approved'),
('Chrysanthemoides monilifera', ARRAY['Bitou bush', 'Boneseed'], 'Asteraceae', 'approved'),
('Genista monspessulana', ARRAY['Montpellier broom', 'Cape broom'], 'Fabaceae', 'approved'),
('Cytisus scoparius', ARRAY['Scotch broom', 'English broom'], 'Fabaceae', 'approved'),
('Ricinus communis', ARRAY['Castor oil plant'], 'Euphorbiaceae', 'approved'),
('Schinus terebinthifolia', ARRAY['Broad-leaved pepper tree', 'Brazilian pepper tree'], 'Anacardiaceae', 'approved'),
('Erythrina x sykesii', ARRAY['Coral tree', 'Common coral tree'], 'Fabaceae', 'approved'),
('Salix babylonica', ARRAY['Weeping willow'], 'Salicaceae', 'approved'),
('Salix fragilis', ARRAY['Crack willow'], 'Salicaceae', 'approved'),
('Acacia baileyana', ARRAY['Cootamundra wattle'], 'Fabaceae', 'approved'),
('Acacia saligna', ARRAY['Golden wreath wattle', 'Blue-leaved wattle'], 'Fabaceae', 'approved'),
('Psidium guajava', ARRAY['Guava', 'Common guava'], 'Myrtaceae', 'approved'),
('Tecoma stans', ARRAY['Yellow bells', 'Yellow elder'], 'Bignoniaceae', 'approved'),
('Spathodea campanulata', ARRAY['African tulip tree'], 'Bignoniaceae', 'approved'),
('Leucaena leucocephala', ARRAY['Leucaena', 'Lead tree'], 'Fabaceae', 'approved'),
('Cotoneaster glaucophyllus', ARRAY['Cotoneaster', 'Large-leaved cotoneaster'], 'Rosaceae', 'approved'),
('Cotoneaster pannosus', ARRAY['Velvet cotoneaster', 'Silver-leaf cotoneaster'], 'Rosaceae', 'approved'),
('Pyracantha angustifolia', ARRAY['Firethorn', 'Orange firethorn'], 'Rosaceae', 'approved'),
('Lantana montevidensis', ARRAY['Creeping lantana', 'Trailing lantana'], 'Verbenaceae', 'approved'),
('Melia azedarach', ARRAY['White cedar', 'Chinaberry'], 'Meliaceae', 'approved'),
('Gleditsia triacanthos', ARRAY['Honey locust'], 'Fabaceae', 'approved'),
('Ailanthus altissima', ARRAY['Tree of heaven'], 'Simaroubaceae', 'approved'),
('Tipuana tipu', ARRAY['Tipuana', 'Rosewood', 'Pride of Bolivia'], 'Fabaceae', 'approved'),
('Robinia pseudoacacia', ARRAY['Black locust', 'False acacia'], 'Fabaceae', 'approved'),
('Toona ciliata', ARRAY['Red cedar', 'Australian red cedar'], 'Meliaceae', 'approved'),
('Cinnamomum verum', ARRAY['Cinnamon tree', 'True cinnamon'], 'Lauraceae', 'approved'),
('Syzygium jambos', ARRAY['Rose apple'], 'Myrtaceae', 'approved'),

-- ===== AQUATIC WEEDS =====
('Eichhornia crassipes', ARRAY['Water hyacinth'], 'Pontederiaceae', 'approved'),
('Salvinia molesta', ARRAY['Salvinia', 'Giant salvinia', 'Kariba weed'], 'Salviniaceae', 'approved'),
('Ludwigia peruviana', ARRAY['Ludwigia', 'Peruvian primrose bush', 'Water primrose'], 'Onagraceae', 'approved'),
('Alternanthera philoxeroides', ARRAY['Alligator weed'], 'Amaranthaceae', 'approved'),
('Cabomba caroliniana', ARRAY['Cabomba', 'Fanwort'], 'Cabombaceae', 'approved'),
('Pistia stratiotes', ARRAY['Water lettuce', 'Nile cabbage'], 'Araceae', 'approved'),
('Sagittaria platyphylla', ARRAY['Delta arrowhead', 'Sagittaria'], 'Alismataceae', 'approved'),
('Egeria densa', ARRAY['Dense waterweed', 'Egeria', 'Brazilian elodea'], 'Hydrocharitaceae', 'approved'),
('Myriophyllum aquaticum', ARRAY['Parrot''s feather', 'Brazilian watermilfoil'], 'Haloragaceae', 'approved'),
('Hymenachne amplexicaulis', ARRAY['Hymenachne', 'Olive hymenachne'], 'Poaceae', 'approved'),

-- ===== GRASSES / SEDGES =====
('Ehrharta erecta', ARRAY['Panic veldtgrass', 'Veldt grass'], 'Poaceae', 'approved'),
('Chloris gayana', ARRAY['Rhodes grass'], 'Poaceae', 'approved'),
('Eragrostis curvula', ARRAY['African lovegrass'], 'Poaceae', 'approved'),
('Sporobolus fertilis', ARRAY['Giant Parramatta grass'], 'Poaceae', 'approved'),
('Sporobolus africanus', ARRAY['Parramatta grass'], 'Poaceae', 'approved'),
('Cortaderia selloana', ARRAY['Pampas grass', 'White pampas grass'], 'Poaceae', 'approved'),
('Cortaderia jubata', ARRAY['Purple pampas grass', 'Pink pampas grass', 'Jubata grass'], 'Poaceae', 'approved'),
('Nassella neesiana', ARRAY['Chilean needle grass'], 'Poaceae', 'approved'),
('Nassella trichotoma', ARRAY['Serrated tussock'], 'Poaceae', 'approved'),
('Stenotaphrum secundatum', ARRAY['Buffalo grass'], 'Poaceae', 'approved'),
('Pennisetum setaceum', ARRAY['Fountain grass', 'African fountain grass'], 'Poaceae', 'approved'),
('Pennisetum clandestinum', ARRAY['Kikuyu grass', 'Kikuyu'], 'Poaceae', 'approved'),
('Andropogon virginicus', ARRAY['Whiskey grass', 'Broomsedge bluestem'], 'Poaceae', 'approved'),
('Megathyrsus maximus', ARRAY['Guinea grass', 'Green panic'], 'Poaceae', 'approved'),
('Cyperus involucratus', ARRAY['Umbrella sedge', 'Flat sedge'], 'Cyperaceae', 'approved'),
('Paspalum quadrifarium', ARRAY['Tussock paspalum'], 'Poaceae', 'approved'),
('Axonopus fissifolius', ARRAY['Narrow-leaved carpet grass'], 'Poaceae', 'approved'),

-- ===== HERBACEOUS WEEDS =====
('Ageratina adenophora', ARRAY['Crofton weed'], 'Asteraceae', 'approved'),
('Bidens pilosa', ARRAY['Cobbler''s pegs', 'Farmer''s friend'], 'Asteraceae', 'approved'),
('Conyza bonariensis', ARRAY['Flaxleaf fleabane', 'Tall fleabane'], 'Asteraceae', 'approved'),
('Senecio madagascariensis', ARRAY['Fireweed', 'Madagascar ragwort'], 'Asteraceae', 'approved'),
('Hypericum perforatum', ARRAY['St John''s wort'], 'Hypericaceae', 'approved'),
('Solanum nigrum', ARRAY['Blackberry nightshade', 'Black nightshade'], 'Solanaceae', 'approved'),
('Cirsium vulgare', ARRAY['Spear thistle', 'Scotch thistle'], 'Asteraceae', 'approved'),
('Sonchus oleraceus', ARRAY['Common sowthistle', 'Milk thistle'], 'Asteraceae', 'approved'),
('Ageratina riparia', ARRAY['Mistflower', 'Creeping crofton weed'], 'Asteraceae', 'approved'),
('Baccharis halimifolia', ARRAY['Groundsel bush', 'Groundsel tree'], 'Asteraceae', 'approved'),
('Parthenium hysterophorus', ARRAY['Parthenium weed', 'Famine weed'], 'Asteraceae', 'approved'),
('Ambrosia artemisiifolia', ARRAY['Annual ragweed', 'Common ragweed'], 'Asteraceae', 'approved'),
('Sida rhombifolia', ARRAY['Paddy''s lucerne', 'Sida retusa'], 'Malvaceae', 'approved'),
('Verbena bonariensis', ARRAY['Purpletop', 'South American vervain'], 'Verbenaceae', 'approved'),
('Phytolacca octandra', ARRAY['Inkweed', 'Pokeweed'], 'Phytolaccaceae', 'approved'),
('Canna indica', ARRAY['Canna lily', 'Indian shot'], 'Cannaceae', 'approved'),
('Hedychium gardnerianum', ARRAY['Kahili ginger', 'Yellow ginger'], 'Zingiberaceae', 'approved'),
('Hedychium coronarium', ARRAY['White ginger', 'White ginger lily'], 'Zingiberaceae', 'approved'),
('Zantedeschia aethiopica', ARRAY['Arum lily', 'White arum lily'], 'Araceae', 'approved'),
('Polygala myrtifolia', ARRAY['Myrtle-leaf milkwort', 'Sweet pea bush'], 'Polygalaceae', 'approved'),
('Oxalis pes-caprae', ARRAY['Soursob', 'Bermuda buttercup'], 'Oxalidaceae', 'approved'),
('Oenothera stricta', ARRAY['Common evening primrose'], 'Onagraceae', 'approved'),
('Stachytarpheta cayennensis', ARRAY['Blue snakeweed', 'Cayenne snakeweed'], 'Verbenaceae', 'approved'),

-- ===== SUCCULENTS / CACTI =====
('Opuntia stricta', ARRAY['Prickly pear', 'Common prickly pear'], 'Cactaceae', 'approved'),
('Opuntia monacantha', ARRAY['Drooping prickly pear'], 'Cactaceae', 'approved'),
('Bryophyllum delagoense', ARRAY['Mother of millions', 'Chandelier plant'], 'Crassulaceae', 'approved'),
('Bryophyllum x houghtonii', ARRAY['Mother of millions hybrid'], 'Crassulaceae', 'approved'),
('Cylindropuntia imbricata', ARRAY['Devil''s rope pear', 'Rope pear', 'Tree cholla'], 'Cactaceae', 'approved'),
('Cylindropuntia rosea', ARRAY['Hudson pear'], 'Cactaceae', 'approved'),
('Cereus uruguayanus', ARRAY['Night-blooming cereus', 'Apple cactus'], 'Cactaceae', 'approved'),
('Harrisia martinii', ARRAY['Harrisia cactus', 'Moon cactus'], 'Cactaceae', 'approved'),
('Austrocylindropuntia subulata', ARRAY['Eve''s needle cactus', 'Eve''s pin'], 'Cactaceae', 'approved')
;


-- -----------------------------------------------------------------------------
-- 2. SPECIES SYNONYMS
-- Known taxonomic synonyms where nomenclature has changed
-- -----------------------------------------------------------------------------

INSERT INTO public.species_synonyms (species_id, synonym_name, synonym_type) VALUES

-- Acetosa sagittata was formerly Rumex sagittatus
((SELECT id FROM public.species WHERE scientific_name = 'Acetosa sagittata'), 'Rumex sagittatus', 'scientific'),

-- Cat's claw creeper was formerly Macfadyena unguis-cati
((SELECT id FROM public.species WHERE scientific_name = 'Dolichandra unguis-cati'), 'Macfadyena unguis-cati', 'scientific'),
((SELECT id FROM public.species WHERE scientific_name = 'Dolichandra unguis-cati'), 'Bignonia unguis-cati', 'scientific'),

-- Water hyacinth reclassified to Pontederia crassipes
((SELECT id FROM public.species WHERE scientific_name = 'Eichhornia crassipes'), 'Pontederia crassipes', 'scientific'),

-- Asparagus fern was Protasparagus aethiopicus in some treatments
((SELECT id FROM public.species WHERE scientific_name = 'Asparagus aethiopicus'), 'Protasparagus aethiopicus', 'scientific'),

-- Bridal creeper synonym
((SELECT id FROM public.species WHERE scientific_name = 'Asparagus asparagoides'), 'Myrsiphyllum asparagoides', 'scientific'),

-- Cape ivy was formerly Senecio mikanioides
((SELECT id FROM public.species WHERE scientific_name = 'Delairea odorata'), 'Senecio mikanioides', 'scientific'),

-- Crofton weed was formerly Eupatorium adenophorum
((SELECT id FROM public.species WHERE scientific_name = 'Ageratina adenophora'), 'Eupatorium adenophorum', 'scientific'),

-- Mistflower was formerly Eupatorium riparium
((SELECT id FROM public.species WHERE scientific_name = 'Ageratina riparia'), 'Eupatorium riparium', 'scientific'),

-- Flaxleaf fleabane has been moved to Erigeron by some authorities
((SELECT id FROM public.species WHERE scientific_name = 'Conyza bonariensis'), 'Erigeron bonariensis', 'scientific'),

-- Giant Parramatta grass was formerly Sporobolus indicus var. major
((SELECT id FROM public.species WHERE scientific_name = 'Sporobolus fertilis'), 'Sporobolus indicus var. major', 'scientific'),

-- Chilean needle grass was formerly Stipa neesiana
((SELECT id FROM public.species WHERE scientific_name = 'Nassella neesiana'), 'Stipa neesiana', 'scientific'),

-- Serrated tussock was formerly Stipa trichotoma
((SELECT id FROM public.species WHERE scientific_name = 'Nassella trichotoma'), 'Stipa trichotoma', 'scientific'),

-- Guinea grass was formerly Panicum maximum
((SELECT id FROM public.species WHERE scientific_name = 'Megathyrsus maximus'), 'Panicum maximum', 'scientific'),

-- Mother of millions was formerly Kalanchoe delagoensis / Bryophyllum tubiflorum
((SELECT id FROM public.species WHERE scientific_name = 'Bryophyllum delagoense'), 'Kalanchoe delagoensis', 'scientific'),
((SELECT id FROM public.species WHERE scientific_name = 'Bryophyllum delagoense'), 'Bryophyllum tubiflorum', 'scientific'),

-- Senna pendula was formerly Cassia pendula / Senna pendula var. glabrata
((SELECT id FROM public.species WHERE scientific_name = 'Senna pendula'), 'Cassia pendula', 'scientific'),
((SELECT id FROM public.species WHERE scientific_name = 'Senna pendula'), 'Senna pendula var. glabrata', 'scientific'),

-- Chrysanthemoides monilifera subsp. rotundata is bitou bush, subsp. monilifera is boneseed
((SELECT id FROM public.species WHERE scientific_name = 'Chrysanthemoides monilifera'), 'Osteospermum moniliferum', 'scientific'),

-- Moth vine synonym
((SELECT id FROM public.species WHERE scientific_name = 'Araujia sericifera'), 'Araujia hortorum', 'scientific'),

-- Fountain grass reclassified to Cenchrus
((SELECT id FROM public.species WHERE scientific_name = 'Pennisetum setaceum'), 'Cenchrus setaceus', 'scientific'),

-- Kikuyu grass reclassified to Cenchrus
((SELECT id FROM public.species WHERE scientific_name = 'Pennisetum clandestinum'), 'Cenchrus clandestinus', 'scientific'),

-- African olive was formerly Olea europaea subsp. africana in older references
((SELECT id FROM public.species WHERE scientific_name = 'Olea europaea subsp. cuspidata'), 'Olea europaea subsp. africana', 'scientific'),

-- Dense waterweed synonym
((SELECT id FROM public.species WHERE scientific_name = 'Egeria densa'), 'Elodea densa', 'scientific'),

-- Eve's needle cactus was formerly Opuntia subulata
((SELECT id FROM public.species WHERE scientific_name = 'Austrocylindropuntia subulata'), 'Opuntia subulata', 'scientific'),

-- Parrot's feather synonym
((SELECT id FROM public.species WHERE scientific_name = 'Myriophyllum aquaticum'), 'Myriophyllum brasiliense', 'scientific'),

-- Climbing asparagus fern was Protasparagus plumosus
((SELECT id FROM public.species WHERE scientific_name = 'Asparagus plumosus'), 'Protasparagus plumosus', 'scientific'),

-- Night-blooming cereus synonym
((SELECT id FROM public.species WHERE scientific_name = 'Cereus uruguayanus'), 'Cereus hildmannianus', 'scientific')
;
