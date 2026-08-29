-- Additive re-extraction of the four article-publication branches in the
-- official PSU-MG 2027 curricular annexes. The quarantined CORE rows and the
-- APP-SCIENTIFIC-MVP-v2 release remain immutable.

insert into public.scientific_import_batches (
    batch_key,
    core_version,
    source_file_name,
    source_sha256,
    mapping_release,
    mapping_sha256,
    status,
    counts,
    completed_at
)
values (
    'PSU-MG-2027-ARTICLE-RULES-v1',
    'PSU-MG-2027-OFFICIAL-ANNEXES-2026-07-16',
    'Anexo 1 Entrada Direta + Anexo 2 Pre-Requisito PSU-MG 2027',
    '899937c81a977791576a688e9b865e6c241f05144c8de405509c9bb3e3631b76',
    'APP-SCIENTIFIC-PSU-MG-2027-v1',
    '161c8e0766ee4d81aa9bb764e7c56277a941ffc8f5a6273c36e0191426d6e53c',
    'APPLIED',
    '{"rules":4,"published_rules":4,"official_documents":2}'::jsonb,
    now()
)
on conflict (batch_key) do nothing;

with source_rules as (
    select *
    from jsonb_to_recordset($psu_mg_rules$[
      {
        "source_rule_id":"PSU-MG-2027-ED-11A",
        "source_process_id":"2027-MG-PSU-MG-AREMG",
        "release_code":"APP-SCIENTIFIC-PSU-MG-2027-v1",
        "core_version":"PSU-MG-2027-OFFICIAL-ANNEXES-2026-07-16",
        "family":"ARTIGO_PUBLICACAO",
        "production_type":"ARTICLE_PUBLICATION",
        "accepted_production_types":["ARTICLE_PUBLICATION"],
        "initial_eligibility":"SIM_SEM_CALCULO",
        "mapping_status":"APPROVED",
        "published_for_engine":true,
        "mapping_confidence":"HIGH",
        "scope":{"processo_id":"2027-MG-PSU-MG-AREMG","scope_type":"Tipo de acesso","access_type":"DIRECT","inclusion_operator":"INCLUDE","source_item":"11a"},
        "condition_groups":[{"code":"ROOT","parent":null,"operator":"ALL","critical":true,"conditions":[
          {"field":"production.type","operator":"EQ","value":"ARTICLE_PUBLICATION","required":true,"negated":false,"confidence":"HIGH","evidence_ref":"OFFICIAL_ANNEX"},
          {"field":"production.publication_status","operator":"EQ","value":"PUBLISHED","required":true,"negated":false,"confidence":"HIGH","evidence_ref":"OFFICIAL_ANNEX"},
          {"field":"production.authorship.role","operator":"IN","value":["AUTHOR","COAUTHOR"],"required":true,"negated":false,"confidence":"HIGH","evidence_ref":"OFFICIAL_ANNEX"},
          {"field":"production.identifiers.doi","operator":"IS_TRUE","value":true,"required":true,"negated":false,"confidence":"HIGH","evidence_ref":"OFFICIAL_ANNEX"},
          {"field":"production.identifiers.issn","operator":"IS_TRUE","value":true,"required":true,"negated":false,"confidence":"HIGH","evidence_ref":"OFFICIAL_ANNEX"},
          {"field":"production.subject_area_relation","operator":"MANUAL","value":{"kind":"HEALTH_OR_MEDICINE"},"required":true,"negated":false,"confidence":"HIGH","evidence_ref":"OFFICIAL_ANNEX","review_message":"Confirmar que o artigo está relacionado às Ciências da Saúde ou Medicina."},
          {"field":"manual.source_condition","operator":"MANUAL","value":{"kind":"DURING_MEDICAL_GRADUATION"},"required":true,"negated":false,"confidence":"HIGH","evidence_ref":"OFFICIAL_ANNEX","review_message":"Confirmar que o artigo foi produzido durante a graduação em Medicina."},
          {"field":"manual.source_condition","operator":"MANUAL","value":{"kind":"AUTHOR_COMPOSITION_AND_ADVISOR_RQE"},"required":true,"negated":false,"confidence":"HIGH","evidence_ref":"OFFICIAL_ANNEX","review_message":"Confirmar a composição de autoria e pelo menos um médico orientador especialista com RQE comprovado."},
          {"field":"manual.source_condition","operator":"MANUAL","value":{"kind":"PEER_REVIEW_AND_EDITORIAL_QUALITY"},"required":true,"negated":false,"confidence":"HIGH","evidence_ref":"OFFICIAL_ANNEX","review_message":"Confirmar revisão por pares e os critérios de qualidade científica e editorial do periódico."}
        ]}],
        "score_formula":{"type":"PER_ITEM","points_per_item":1,"item_limit":1,"maximum_points":1,"unit":"ARTICLE","source_text":"Item 11a"},
        "indexing_requirements":[
          {"base":"MEDLINE","operator":"ANY","exact_match_allowed":true,"confidence":"HIGH","source_text":"MEDLINE/PubMed"},
          {"base":"PUBMED","operator":"ANY","exact_match_allowed":true,"confidence":"HIGH","source_text":"MEDLINE/PubMed"},
          {"base":"EMBASE","operator":"ANY","exact_match_allowed":true,"confidence":"HIGH","source_text":"Embase"},
          {"base":"SCOPUS","operator":"ANY","exact_match_allowed":true,"confidence":"HIGH","source_text":"Scopus"},
          {"base":"WEB_OF_SCIENCE","operator":"ANY","exact_match_allowed":true,"confidence":"HIGH","source_text":"Web of Science"}
        ],
        "qualis_requirement":null,
        "authorship_requirement":{"roles":["AUTHOR","COAUTHOR"],"source_text":"autor ou coautor","confidence":"HIGH"},
        "document_requirements":["FIRST_PAGE","JOURNAL_IDENTIFICATION","DOI","INDEXING_EVIDENCE"],
        "date_window":{"kind":"DURING_MEDICAL_GRADUATION","source_text":"durante a graduação em Medicina"},
        "presentation_formats":[],"event_scopes":[],"publication_scopes":[],"event_organizer":null,
        "subject_area_requirement":{"kind":"HEALTH_OR_MEDICINE","source_text":"Ciências da Saúde ou Medicina"},
        "evidence":{"official_url":"https://www.galaxcms.com.br/up_crud_comum/601/Anexo1-AvaliacaoCurricularPadronizadaEntradaDiretaPSUMG2027-20260716100113.pdf","page":"23–25","document_sha256":"8218e70f5fa5ce59f599d54a6075908320c053331be32f37ab70ad8eaf3b64bf","source_status":"Confirmado em fonte oficial","excerpt":"Item 11a"},
        "unknown_data":["production.subject_area_relation","production.temporal_relation_to_graduation","production.advisor.rqe","production.peer_review_status"],
        "warnings":["MANUAL_AUTHORSHIP_AND_RQE_REVIEW","DOCUMENTARY_VALIDATION_REQUIRED"],
        "review":{"automated_technical_review":true,"human_review":false,"decision":"APPROVE","method":"OFFICIAL_SOURCE_REEXTRACTION","reviewer":"codex-primary-agent"},
        "source_metadata":{"classification_reason":"Indexadores exatos; condições adicionais preservadas para conferência.","review_messages":["Confirmar a composição de autoria e pelo menos um médico orientador especialista com RQE comprovado."],"source_gaps":"Edital principal ainda não publicado; regra extraída do anexo curricular oficial."},
        "mapping_hash":"3e157dbc867c6f526bc544f73e0173c44cf904fe722d2a5e8c42f1538e7dd552"
      },
      {
        "source_rule_id":"PSU-MG-2027-ED-11B",
        "source_process_id":"2027-MG-PSU-MG-AREMG",
        "release_code":"APP-SCIENTIFIC-PSU-MG-2027-v1",
        "core_version":"PSU-MG-2027-OFFICIAL-ANNEXES-2026-07-16",
        "family":"ARTIGO_PUBLICACAO",
        "production_type":"ARTICLE_PUBLICATION",
        "accepted_production_types":["ARTICLE_PUBLICATION"],
        "initial_eligibility":"SIM_SEM_CALCULO",
        "mapping_status":"APPROVED",
        "published_for_engine":true,
        "mapping_confidence":"HIGH",
        "scope":{"processo_id":"2027-MG-PSU-MG-AREMG","scope_type":"Tipo de acesso","access_type":"DIRECT","inclusion_operator":"INCLUDE","source_item":"11b"},
        "condition_groups":[{"code":"ROOT","parent":null,"operator":"ALL","critical":true,"conditions":[
          {"field":"production.type","operator":"EQ","value":"ARTICLE_PUBLICATION","required":true,"negated":false,"confidence":"HIGH","evidence_ref":"OFFICIAL_ANNEX"},
          {"field":"production.publication_status","operator":"EQ","value":"PUBLISHED","required":true,"negated":false,"confidence":"HIGH","evidence_ref":"OFFICIAL_ANNEX"},
          {"field":"production.authorship.role","operator":"IN","value":["AUTHOR","COAUTHOR"],"required":true,"negated":false,"confidence":"HIGH","evidence_ref":"OFFICIAL_ANNEX"},
          {"field":"production.identifiers.doi","operator":"IS_TRUE","value":true,"required":true,"negated":false,"confidence":"HIGH","evidence_ref":"OFFICIAL_ANNEX"},
          {"field":"production.identifiers.issn","operator":"IS_TRUE","value":true,"required":true,"negated":false,"confidence":"HIGH","evidence_ref":"OFFICIAL_ANNEX"},
          {"field":"production.subject_area_relation","operator":"MANUAL","value":{"kind":"HEALTH_OR_MEDICINE"},"required":true,"negated":false,"confidence":"HIGH","evidence_ref":"OFFICIAL_ANNEX","review_message":"Confirmar que o artigo está relacionado às Ciências da Saúde ou Medicina."},
          {"field":"manual.source_condition","operator":"MANUAL","value":{"kind":"DURING_MEDICAL_GRADUATION"},"required":true,"negated":false,"confidence":"HIGH","evidence_ref":"OFFICIAL_ANNEX","review_message":"Confirmar que o artigo foi produzido durante a graduação em Medicina."},
          {"field":"manual.source_condition","operator":"MANUAL","value":{"kind":"AUTHOR_COMPOSITION_AND_ADVISOR_RQE"},"required":true,"negated":false,"confidence":"HIGH","evidence_ref":"OFFICIAL_ANNEX","review_message":"Confirmar a composição de autoria e pelo menos um médico orientador especialista com RQE comprovado."},
          {"field":"manual.source_condition","operator":"MANUAL","value":{"kind":"PEER_REVIEW_AND_EDITORIAL_QUALITY"},"required":true,"negated":false,"confidence":"HIGH","evidence_ref":"OFFICIAL_ANNEX","review_message":"Confirmar revisão por pares e os critérios de qualidade científica e editorial do periódico."}
        ]}],
        "score_formula":{"type":"PER_ITEM","points_per_item":0.5,"item_limit":1,"maximum_points":0.5,"unit":"ARTICLE","source_text":"Item 11b"},
        "indexing_requirements":[
          {"base":"SCIELO","operator":"ANY","exact_match_allowed":true,"confidence":"HIGH","source_text":"SciELO"},
          {"base":"LILACS","operator":"ANY","exact_match_allowed":true,"confidence":"HIGH","source_text":"LILACS"}
        ],
        "qualis_requirement":{"minimum_stratum":"B2","stratum":"B2","operator":"AT_LEAST","exact_match_allowed":true,"system":"QUALIS_CAPES","source_text":"mínimo QUALIS B2 da CAPES","warning":"COMPARES_WITH_JOURNAL_QUALIS_DECLARED_IN_APP"},
        "authorship_requirement":{"roles":["AUTHOR","COAUTHOR"],"source_text":"autor ou coautor","confidence":"HIGH"},
        "document_requirements":["FIRST_PAGE","JOURNAL_IDENTIFICATION","DOI","INDEXING_EVIDENCE","QUALIS_EVIDENCE"],
        "date_window":{"kind":"DURING_MEDICAL_GRADUATION","source_text":"durante a graduação em Medicina"},
        "presentation_formats":[],"event_scopes":[],"publication_scopes":[],"event_organizer":null,
        "subject_area_requirement":{"kind":"HEALTH_OR_MEDICINE","source_text":"Ciências da Saúde ou Medicina"},
        "evidence":{"official_url":"https://www.galaxcms.com.br/up_crud_comum/601/Anexo1-AvaliacaoCurricularPadronizadaEntradaDiretaPSUMG2027-20260716100113.pdf","page":"23–25","document_sha256":"8218e70f5fa5ce59f599d54a6075908320c053331be32f37ab70ad8eaf3b64bf","source_status":"Confirmado em fonte oficial","excerpt":"Item 11b"},
        "unknown_data":["production.subject_area_relation","production.temporal_relation_to_graduation","production.advisor.rqe","production.peer_review_status"],
        "warnings":["MANUAL_AUTHORSHIP_AND_RQE_REVIEW","QUALIS_DECLARED_LEVEL_USED","DOCUMENTARY_VALIDATION_REQUIRED"],
        "review":{"automated_technical_review":true,"human_review":false,"decision":"APPROVE","method":"OFFICIAL_SOURCE_REEXTRACTION","reviewer":"codex-primary-agent"},
        "source_metadata":{"classification_reason":"SciELO/LILACS e Qualis mínimo B2 exatos; condições adicionais preservadas para conferência.","review_messages":["Confirmar a composição de autoria e pelo menos um médico orientador especialista com RQE comprovado."],"source_gaps":"Edital principal ainda não publicado; regra extraída do anexo curricular oficial."},
        "mapping_hash":"5e9a5ec389ed69ce30cef943fe3c045a62c090e4b5483f823f12b1429f081ccd"
      },
      {
        "source_rule_id":"PSU-MG-2027-PR-6A",
        "source_process_id":"2027-MG-PSU-MG-AREMG",
        "release_code":"APP-SCIENTIFIC-PSU-MG-2027-v1",
        "core_version":"PSU-MG-2027-OFFICIAL-ANNEXES-2026-07-16",
        "family":"ARTIGO_PUBLICACAO",
        "production_type":"ARTICLE_PUBLICATION",
        "accepted_production_types":["ARTICLE_PUBLICATION"],
        "initial_eligibility":"SIM_SEM_CALCULO",
        "mapping_status":"APPROVED",
        "published_for_engine":true,
        "mapping_confidence":"HIGH",
        "scope":{"processo_id":"2027-MG-PSU-MG-AREMG","scope_type":"Tipo de acesso","access_type":"PREREQUISITE","inclusion_operator":"INCLUDE","source_item":"6a"},
        "condition_groups":[{"code":"ROOT","parent":null,"operator":"ALL","critical":true,"conditions":[
          {"field":"production.type","operator":"EQ","value":"ARTICLE_PUBLICATION","required":true,"negated":false,"confidence":"HIGH","evidence_ref":"OFFICIAL_ANNEX"},
          {"field":"production.publication_status","operator":"EQ","value":"PUBLISHED","required":true,"negated":false,"confidence":"HIGH","evidence_ref":"OFFICIAL_ANNEX"},
          {"field":"production.authorship.role","operator":"IN","value":["AUTHOR","COAUTHOR"],"required":true,"negated":false,"confidence":"HIGH","evidence_ref":"OFFICIAL_ANNEX"},
          {"field":"production.identifiers.doi","operator":"IS_TRUE","value":true,"required":true,"negated":false,"confidence":"HIGH","evidence_ref":"OFFICIAL_ANNEX"},
          {"field":"production.identifiers.issn","operator":"IS_TRUE","value":true,"required":true,"negated":false,"confidence":"HIGH","evidence_ref":"OFFICIAL_ANNEX"},
          {"field":"production.subject_area_relation","operator":"MANUAL","value":{"kind":"HEALTH_OR_MEDICINE"},"required":true,"negated":false,"confidence":"HIGH","evidence_ref":"OFFICIAL_ANNEX","review_message":"Confirmar que o artigo está relacionado às Ciências da Saúde ou Medicina."},
          {"field":"manual.source_condition","operator":"MANUAL","value":{"kind":"ROLLING_FIVE_YEARS"},"required":true,"negated":false,"confidence":"HIGH","evidence_ref":"OFFICIAL_ANNEX","review_message":"Confirmar que a publicação ocorreu nos últimos cinco anos."},
          {"field":"manual.source_condition","operator":"MANUAL","value":{"kind":"AUTHOR_COMPOSITION_AND_ADVISOR_RQE"},"required":true,"negated":false,"confidence":"HIGH","evidence_ref":"OFFICIAL_ANNEX","review_message":"Confirmar a composição de autoria e pelo menos um médico orientador especialista com RQE comprovado."},
          {"field":"manual.source_condition","operator":"MANUAL","value":{"kind":"PEER_REVIEW_AND_EDITORIAL_QUALITY"},"required":true,"negated":false,"confidence":"HIGH","evidence_ref":"OFFICIAL_ANNEX","review_message":"Confirmar revisão por pares e os critérios de qualidade científica e editorial do periódico."}
        ]}],
        "score_formula":{"type":"PER_ITEM","points_per_item":2,"item_limit":1,"maximum_points":2,"unit":"ARTICLE","source_text":"Item 6a"},
        "indexing_requirements":[
          {"base":"MEDLINE","operator":"ANY","exact_match_allowed":true,"confidence":"HIGH","source_text":"MEDLINE/PubMed"},
          {"base":"PUBMED","operator":"ANY","exact_match_allowed":true,"confidence":"HIGH","source_text":"MEDLINE/PubMed"},
          {"base":"EMBASE","operator":"ANY","exact_match_allowed":true,"confidence":"HIGH","source_text":"Embase"},
          {"base":"SCOPUS","operator":"ANY","exact_match_allowed":true,"confidence":"HIGH","source_text":"Scopus"},
          {"base":"WEB_OF_SCIENCE","operator":"ANY","exact_match_allowed":true,"confidence":"HIGH","source_text":"Web of Science"}
        ],
        "qualis_requirement":null,
        "authorship_requirement":{"roles":["AUTHOR","COAUTHOR"],"source_text":"autor ou coautor","confidence":"HIGH"},
        "document_requirements":["FIRST_PAGE","JOURNAL_IDENTIFICATION","DOI","INDEXING_EVIDENCE"],
        "date_window":{"kind":"ROLLING_YEARS","years":5,"source_text":"últimos 05 anos"},
        "presentation_formats":[],"event_scopes":[],"publication_scopes":[],"event_organizer":null,
        "subject_area_requirement":{"kind":"HEALTH_OR_MEDICINE","source_text":"Ciências da Saúde ou Medicina"},
        "evidence":{"official_url":"https://www.galaxcms.com.br/up_crud_comum/601/Anexo2AvaliacaoCurricularPadronizadaPre-RequisitoPSUMG2027-20260716100202.pdf","page":"13–15","document_sha256":"727736b54e6cc5a224fba6327162db0197fbd7da8deaf69af378e1e193d42a12","source_status":"Confirmado em fonte oficial","excerpt":"Item 6a"},
        "unknown_data":["production.subject_area_relation","production.publication_age_months","production.advisor.rqe","production.peer_review_status"],
        "warnings":["MANUAL_AUTHORSHIP_AND_RQE_REVIEW","ROLLING_DATE_REQUIRES_REVIEW","DOCUMENTARY_VALIDATION_REQUIRED"],
        "review":{"automated_technical_review":true,"human_review":false,"decision":"APPROVE","method":"OFFICIAL_SOURCE_REEXTRACTION","reviewer":"codex-primary-agent"},
        "source_metadata":{"classification_reason":"Indexadores exatos; janela de cinco anos e condições adicionais preservadas para conferência.","review_messages":["Confirmar a composição de autoria e pelo menos um médico orientador especialista com RQE comprovado."],"source_gaps":"Edital principal ainda não publicado; regra extraída do anexo curricular oficial."},
        "mapping_hash":"cb40a1fe47ecb4ec6bba7b695360681ab186debee422d54ff545ffdb4cfdce3d"
      },
      {
        "source_rule_id":"PSU-MG-2027-PR-6B",
        "source_process_id":"2027-MG-PSU-MG-AREMG",
        "release_code":"APP-SCIENTIFIC-PSU-MG-2027-v1",
        "core_version":"PSU-MG-2027-OFFICIAL-ANNEXES-2026-07-16",
        "family":"ARTIGO_PUBLICACAO",
        "production_type":"ARTICLE_PUBLICATION",
        "accepted_production_types":["ARTICLE_PUBLICATION"],
        "initial_eligibility":"SIM_SEM_CALCULO",
        "mapping_status":"APPROVED",
        "published_for_engine":true,
        "mapping_confidence":"HIGH",
        "scope":{"processo_id":"2027-MG-PSU-MG-AREMG","scope_type":"Tipo de acesso","access_type":"PREREQUISITE","inclusion_operator":"INCLUDE","source_item":"6b"},
        "condition_groups":[{"code":"ROOT","parent":null,"operator":"ALL","critical":true,"conditions":[
          {"field":"production.type","operator":"EQ","value":"ARTICLE_PUBLICATION","required":true,"negated":false,"confidence":"HIGH","evidence_ref":"OFFICIAL_ANNEX"},
          {"field":"production.publication_status","operator":"EQ","value":"PUBLISHED","required":true,"negated":false,"confidence":"HIGH","evidence_ref":"OFFICIAL_ANNEX"},
          {"field":"production.authorship.role","operator":"IN","value":["AUTHOR","COAUTHOR"],"required":true,"negated":false,"confidence":"HIGH","evidence_ref":"OFFICIAL_ANNEX"},
          {"field":"production.identifiers.doi","operator":"IS_TRUE","value":true,"required":true,"negated":false,"confidence":"HIGH","evidence_ref":"OFFICIAL_ANNEX"},
          {"field":"production.identifiers.issn","operator":"IS_TRUE","value":true,"required":true,"negated":false,"confidence":"HIGH","evidence_ref":"OFFICIAL_ANNEX"},
          {"field":"production.subject_area_relation","operator":"MANUAL","value":{"kind":"HEALTH_OR_MEDICINE"},"required":true,"negated":false,"confidence":"HIGH","evidence_ref":"OFFICIAL_ANNEX","review_message":"Confirmar que o artigo está relacionado às Ciências da Saúde ou Medicina."},
          {"field":"manual.source_condition","operator":"MANUAL","value":{"kind":"ROLLING_FIVE_YEARS"},"required":true,"negated":false,"confidence":"HIGH","evidence_ref":"OFFICIAL_ANNEX","review_message":"Confirmar que a publicação ocorreu nos últimos cinco anos."},
          {"field":"manual.source_condition","operator":"MANUAL","value":{"kind":"AUTHOR_COMPOSITION_AND_ADVISOR_RQE"},"required":true,"negated":false,"confidence":"HIGH","evidence_ref":"OFFICIAL_ANNEX","review_message":"Confirmar a composição de autoria e pelo menos um médico orientador especialista com RQE comprovado."},
          {"field":"manual.source_condition","operator":"MANUAL","value":{"kind":"PEER_REVIEW_AND_EDITORIAL_QUALITY"},"required":true,"negated":false,"confidence":"HIGH","evidence_ref":"OFFICIAL_ANNEX","review_message":"Confirmar revisão por pares e os critérios de qualidade científica e editorial do periódico."}
        ]}],
        "score_formula":{"type":"PER_ITEM","points_per_item":1,"item_limit":1,"maximum_points":1,"unit":"ARTICLE","source_text":"Item 6b"},
        "indexing_requirements":[
          {"base":"SCIELO","operator":"ANY","exact_match_allowed":true,"confidence":"HIGH","source_text":"SciELO"},
          {"base":"LILACS","operator":"ANY","exact_match_allowed":true,"confidence":"HIGH","source_text":"LILACS"}
        ],
        "qualis_requirement":{"minimum_stratum":"B2","stratum":"B2","operator":"AT_LEAST","exact_match_allowed":true,"system":"QUALIS_CAPES","source_text":"mínimo QUALIS B2 da CAPES","warning":"COMPARES_WITH_JOURNAL_QUALIS_DECLARED_IN_APP"},
        "authorship_requirement":{"roles":["AUTHOR","COAUTHOR"],"source_text":"autor ou coautor","confidence":"HIGH"},
        "document_requirements":["FIRST_PAGE","JOURNAL_IDENTIFICATION","DOI","INDEXING_EVIDENCE","QUALIS_EVIDENCE"],
        "date_window":{"kind":"ROLLING_YEARS","years":5,"source_text":"últimos 05 anos"},
        "presentation_formats":[],"event_scopes":[],"publication_scopes":[],"event_organizer":null,
        "subject_area_requirement":{"kind":"HEALTH_OR_MEDICINE","source_text":"Ciências da Saúde ou Medicina"},
        "evidence":{"official_url":"https://www.galaxcms.com.br/up_crud_comum/601/Anexo2AvaliacaoCurricularPadronizadaPre-RequisitoPSUMG2027-20260716100202.pdf","page":"13–15","document_sha256":"727736b54e6cc5a224fba6327162db0197fbd7da8deaf69af378e1e193d42a12","source_status":"Confirmado em fonte oficial","excerpt":"Item 6b"},
        "unknown_data":["production.subject_area_relation","production.publication_age_months","production.advisor.rqe","production.peer_review_status"],
        "warnings":["MANUAL_AUTHORSHIP_AND_RQE_REVIEW","ROLLING_DATE_REQUIRES_REVIEW","QUALIS_DECLARED_LEVEL_USED","DOCUMENTARY_VALIDATION_REQUIRED"],
        "review":{"automated_technical_review":true,"human_review":false,"decision":"APPROVE","method":"OFFICIAL_SOURCE_REEXTRACTION","reviewer":"codex-primary-agent"},
        "source_metadata":{"classification_reason":"SciELO/LILACS e Qualis mínimo B2 exatos; janela de cinco anos e condições adicionais preservadas para conferência.","review_messages":["Confirmar a composição de autoria e pelo menos um médico orientador especialista com RQE comprovado."],"source_gaps":"Edital principal ainda não publicado; regra extraída do anexo curricular oficial."},
        "mapping_hash":"b87dcd2b62cc8fdc7f88bb5d9f0f13351ec9125476825d3d6a3fcd305bf59f26"
      }
    ]$psu_mg_rules$::jsonb) as item(
        source_rule_id text,
        source_process_id text,
        release_code text,
        core_version text,
        family text,
        production_type text,
        accepted_production_types jsonb,
        initial_eligibility text,
        mapping_status text,
        published_for_engine boolean,
        mapping_confidence text,
        scope jsonb,
        condition_groups jsonb,
        score_formula jsonb,
        indexing_requirements jsonb,
        qualis_requirement jsonb,
        authorship_requirement jsonb,
        document_requirements jsonb,
        date_window jsonb,
        presentation_formats jsonb,
        event_scopes jsonb,
        publication_scopes jsonb,
        event_organizer jsonb,
        subject_area_requirement jsonb,
        evidence jsonb,
        unknown_data jsonb,
        warnings jsonb,
        review jsonb,
        source_metadata jsonb,
        mapping_hash text
    )
)
insert into public.scientific_rules (
    import_batch_id,
    edict_id,
    source_rule_id,
    source_process_id,
    release_code,
    core_version,
    family,
    production_type,
    accepted_production_types,
    initial_eligibility,
    mapping_status,
    published_for_engine,
    mapping_confidence,
    scope,
    condition_groups,
    score_formula,
    indexing_requirements,
    qualis_requirement,
    authorship_requirement,
    document_requirements,
    date_window,
    presentation_formats,
    event_scopes,
    publication_scopes,
    event_organizer,
    subject_area_requirement,
    evidence,
    unknown_data,
    warnings,
    review,
    source_metadata,
    mapping_hash
)
select
    batch.id,
    edict.id,
    item.source_rule_id,
    item.source_process_id,
    item.release_code,
    item.core_version,
    item.family,
    item.production_type,
    item.accepted_production_types,
    item.initial_eligibility,
    item.mapping_status,
    item.published_for_engine,
    item.mapping_confidence,
    item.scope,
    item.condition_groups,
    item.score_formula,
    item.indexing_requirements,
    item.qualis_requirement,
    item.authorship_requirement,
    item.document_requirements,
    item.date_window,
    item.presentation_formats,
    item.event_scopes,
    item.publication_scopes,
    item.event_organizer,
    item.subject_area_requirement,
    item.evidence,
    item.unknown_data,
    item.warnings,
    item.review,
    item.source_metadata,
    item.mapping_hash
from source_rules item
join public.edicts edict
  on edict.source_process_id = item.source_process_id
join public.scientific_import_batches batch
  on batch.batch_key = 'PSU-MG-2027-ARTICLE-RULES-v1'
on conflict (release_code, source_rule_id) do nothing;

do $$
declare
    inserted_count integer;
begin
    select count(*)
      into inserted_count
      from public.scientific_rules
     where release_code = 'APP-SCIENTIFIC-PSU-MG-2027-v1';

    if inserted_count <> 4 then
        raise exception 'Expected 4 PSU-MG 2027 article rules, found %.', inserted_count;
    end if;
end
$$;
