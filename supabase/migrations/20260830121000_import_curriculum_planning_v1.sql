-- Generated from reviewed data/curriculum/2026-08-30/*.json.
-- Immutable after application: future audits must use a new version/migration.
-- New rows only; shared caps and uncertainties are not evaluated as personal eligibility.
do $curriculum_import$
declare
  payload constant jsonb := $curriculum_payload$[
  {
    "source_rule_id": "CURR-FELUMA-2027-DIRECT-BOOK-ORGANIZER",
    "source_process_id": "2027-MG-FELUMA-FELUMA",
    "activity_codes": [
      "BOOK_ORGANIZER"
    ],
    "title": "Organização de livro publicado",
    "access_type": "DIRECT",
    "specialties_text": null,
    "source_item": "Anexo B, publicação de trabalhos científicos, itens 5 e 6",
    "status": "POINTS_CONFIRMED",
    "scoring": {
      "type": "PER_UNIT",
      "points_per_unit": 1,
      "unit": "livro",
      "max_points": 2,
      "max_units": 2,
      "description": "1 ponto por livro organizado, até dois livros; sujeito ao teto conjunto das publicações."
    },
    "shared_caps": [
      {
        "code": "FELUMA-2027-DIRECT-PUBLICATIONS",
        "label": "Publicação de trabalhos científicos - acesso direto",
        "max_points": 2,
        "notes": "Compartilhado com artigos e capítulos; cada publicação só pode pontuar uma vez."
      }
    ],
    "requirements": [
      "Livro efetivamente publicado e com ISBN; o candidato deve constar como organizador.",
      "Anexar PDF com capa, ficha catalográfica e sumário, identificando candidato como organizador, título, ISBN, edição, data e editora."
    ],
    "caveats": [
      "Autoria, coautoria e outras denominações não substituem a identificação como organizador.",
      "Certificados, declarações, cartas ou e-mails de aceite não comprovam publicação do livro.",
      "Organização de livro e autoria de capítulo são categorias distintas na fonte."
    ],
    "evidence": [
      {
        "url": "https://residencia.cmmg.edu.br/wp-content/uploads/2026/07/Edital-de-Inscricao-019-2026-Residencia-Medica-2027-1a-Retificacao.pdf",
        "title": "FELUMA 2027 - Edital 019/2026, 1ª retificação",
        "pages": "45,63,66",
        "sha256": "5d39cc47707747229d5d62d5bb4e2952bf75506c86b57243cf2db6bf3c255f9f"
      }
    ],
    "checked_at": "2026-08-30",
    "record_hash": "63d5925047eb6b700c86b1edaf46a38aec598cdbdbc2f64b3206b812a5c6c10b"
  },
  {
    "source_rule_id": "CURR-FELUMA-2027-DIRECT-EVENT-ORGANIZER",
    "source_process_id": "2027-MG-FELUMA-FELUMA",
    "activity_codes": [
      "EVENT_ORGANIZER"
    ],
    "title": "Comissão organizadora de evento científico",
    "access_type": "DIRECT",
    "specialties_text": null,
    "source_item": "Anexo B, eventos científicos e premiações, itens 1 e 2",
    "status": "POINTS_CONFIRMED",
    "scoring": {
      "type": "PER_UNIT",
      "points_per_unit": 0.5,
      "unit": "documento",
      "max_points": 1,
      "max_units": 2,
      "description": "0,5 ponto por documento de participação na comissão organizadora, até dois documentos."
    },
    "shared_caps": [
      {
        "code": "FELUMA-2027-DIRECT-EVENTS",
        "label": "Eventos científicos e premiações - acesso direto",
        "max_points": 1,
        "notes": "Teto conjunto de palestras, organização, apresentação de trabalhos e premiações."
      }
    ],
    "requirements": [
      "Participação na comissão organizadora de evento científico regional, nacional ou internacional.",
      "A fonte contempla congressos e outras modalidades científicas, como simpósios, jornadas, seminários, palestras e semanas acadêmicas/científicas.",
      "Certificado ou declaração em papel timbrado da instituição organizadora/promotora ou do evento, com candidato, evento, entidades, papel desempenhado, data/período e assinatura/identificação dos responsáveis."
    ],
    "caveats": [
      "Colaborador, secretário e coordenador de mesa não equivalem ao papel de organizador; a natureza da participação deve estar identificada.",
      "O limite de 1 ponto da seção é compartilhado; não multiplicá-lo pela quantidade de modalidades selecionadas."
    ],
    "evidence": [
      {
        "url": "https://residencia.cmmg.edu.br/wp-content/uploads/2026/07/Edital-de-Inscricao-019-2026-Residencia-Medica-2027-1a-Retificacao.pdf",
        "title": "FELUMA 2027 - Edital 019/2026, 1ª retificação",
        "pages": "45,67-68",
        "sha256": "5d39cc47707747229d5d62d5bb4e2952bf75506c86b57243cf2db6bf3c255f9f"
      }
    ],
    "checked_at": "2026-08-30",
    "record_hash": "e3287189858b6d6e753bcca98321b419c8c5f110fba5b4fce8ada6c602e85d6b"
  },
  {
    "source_rule_id": "CURR-FELUMA-2027-DIRECT-EVENT-SPEAKER",
    "source_process_id": "2027-MG-FELUMA-FELUMA",
    "activity_codes": [
      "EVENT_SPEAKER"
    ],
    "title": "Palestrante em evento científico",
    "access_type": "DIRECT",
    "specialties_text": null,
    "source_item": "Anexo B, eventos científicos e premiações, itens 5 e 6",
    "status": "POINTS_CONFIRMED",
    "scoring": {
      "type": "PER_UNIT",
      "points_per_unit": 0.5,
      "unit": "documento",
      "max_points": 1,
      "max_units": 2,
      "description": "0,5 ponto por documento de participação como palestrante, até dois documentos."
    },
    "shared_caps": [
      {
        "code": "FELUMA-2027-DIRECT-EVENTS",
        "label": "Eventos científicos e premiações - acesso direto",
        "max_points": 1,
        "notes": "Teto conjunto de palestras, organização, apresentação de trabalhos e premiações."
      }
    ],
    "requirements": [
      "Atuação como palestrante em evento científico regional, nacional ou internacional.",
      "A fonte contempla congressos e outras modalidades científicas, como simpósios, jornadas, seminários, palestras e semanas acadêmicas/científicas.",
      "Certificado ou declaração em papel timbrado da instituição organizadora/promotora ou do evento, com candidato, evento, entidades, papel desempenhado, data/período e assinatura/identificação dos responsáveis."
    ],
    "caveats": [
      "Colaborador, secretário e coordenador de mesa não equivalem a palestrante; a natureza da participação deve estar identificada no documento.",
      "Não confundir palestra com apresentação de trabalho: são itens diferentes da mesma seção. Não somar o teto da seção uma vez por atividade."
    ],
    "evidence": [
      {
        "url": "https://residencia.cmmg.edu.br/wp-content/uploads/2026/07/Edital-de-Inscricao-019-2026-Residencia-Medica-2027-1a-Retificacao.pdf",
        "title": "FELUMA 2027 - Edital 019/2026, 1ª retificação",
        "pages": "45,67-68",
        "sha256": "5d39cc47707747229d5d62d5bb4e2952bf75506c86b57243cf2db6bf3c255f9f"
      }
    ],
    "checked_at": "2026-08-30",
    "record_hash": "017d40e82e25ba50c00c1180b091f43d9dc70624437f32577c2babe64aaeb672"
  },
  {
    "source_rule_id": "CURR-FELUMA-2027-DIRECT-EXTENSION-PROJECT",
    "source_process_id": "2027-MG-FELUMA-FELUMA",
    "activity_codes": [
      "EXTENSION_PROJECT"
    ],
    "title": "Participação em projeto de extensão extracurricular",
    "access_type": "DIRECT",
    "specialties_text": null,
    "source_item": "Anexo B, aproveitamento extracurricular, item 2",
    "status": "POINTS_CONFIRMED",
    "scoring": {
      "type": "FIXED",
      "points_per_unit": 1,
      "unit": "projeto",
      "max_points": 1,
      "max_units": 1,
      "description": "1 ponto pelo item de extensão extracurricular cumprido, limitado a um projeto."
    },
    "shared_caps": [
      {
        "code": "FELUMA-2027-DIRECT-EXTRACURRICULAR",
        "label": "Aproveitamento extracurricular na graduação em Medicina",
        "max_points": 2,
        "notes": "Teto conjunto de pesquisa, extensão, estágio, monitoria, ligas e voluntariado da seção."
      }
    ],
    "requirements": [
      "Projeto extracurricular realizado durante a graduação em Medicina, com carga total mínima de 80 horas.",
      "Um único certificado ou declaração deve comprovar as 80 horas em um único projeto.",
      "Documento de IES em papel timbrado, com candidato, atividade ou função, mês/ano de início e término, carga total e assinatura/identificação da autoridade ou representante oficial.",
      "Não são aceitos certificados de extensão curricular nem declarações pessoais sem identificação institucional válida."
    ],
    "caveats": [
      "Não somar horas entre projetos ou períodos diferentes, ainda que da mesma instituição ou atividade semelhante.",
      "O mesmo documento só pontua uma vez na seção, no item válido de maior valor. Referência temporal: último dia de inscrição."
    ],
    "evidence": [
      {
        "url": "https://residencia.cmmg.edu.br/wp-content/uploads/2026/07/Edital-de-Inscricao-019-2026-Residencia-Medica-2027-1a-Retificacao.pdf",
        "title": "FELUMA 2027 - Edital 019/2026, 1ª retificação",
        "pages": "45,49,51",
        "sha256": "5d39cc47707747229d5d62d5bb4e2952bf75506c86b57243cf2db6bf3c255f9f"
      }
    ],
    "checked_at": "2026-08-30",
    "record_hash": "2a35d29bb916da86a07715746cd045ab97f7d5620de5a8b511f458a967a94120"
  },
  {
    "source_rule_id": "CURR-FELUMA-2027-DIRECT-RESEARCH-PROJECT",
    "source_process_id": "2027-MG-FELUMA-FELUMA",
    "activity_codes": [
      "RESEARCH"
    ],
    "title": "Participação em projeto de pesquisa",
    "access_type": "DIRECT",
    "specialties_text": null,
    "source_item": "Anexo B, aproveitamento extracurricular, item 1",
    "status": "POINTS_CONFIRMED",
    "scoring": {
      "type": "FIXED",
      "points_per_unit": 1,
      "unit": "projeto",
      "max_points": 1,
      "max_units": 1,
      "description": "1 ponto por cumprir o item de participação em pesquisa; não multiplica por duração ou por projetos."
    },
    "shared_caps": [
      {
        "code": "FELUMA-2027-DIRECT-EXTRACURRICULAR",
        "label": "Aproveitamento extracurricular na graduação em Medicina",
        "max_points": 2,
        "notes": "Teto conjunto de pesquisa, extensão, estágio, monitoria, ligas e voluntariado da seção."
      }
    ],
    "requirements": [
      "Participação durante a graduação em Medicina em um mesmo projeto, por pelo menos 6 meses contínuos.",
      "Um único documento deve demonstrar integralmente o vínculo e a duração mínima; não somar períodos de documentos distintos.",
      "Certificado ou declaração de IES ou instituição de fomento, em papel timbrado, identificando candidato, função, atividade ou projeto e início/término em mês e ano.",
      "Assinatura e identificação da autoridade institucional ou representante oficial; declarações pessoais de professores, orientadores ou pesquisadores não são aceitas."
    ],
    "caveats": [
      "A categoria da fonte é projeto de pesquisa: chamar uma atividade de iniciação científica não comprova automaticamente esse vínculo.",
      "O mesmo documento só pontua uma vez na seção, no item válido de maior valor. Prazos dos documentos têm como referência o último dia de inscrição."
    ],
    "evidence": [
      {
        "url": "https://residencia.cmmg.edu.br/wp-content/uploads/2026/07/Edital-de-Inscricao-019-2026-Residencia-Medica-2027-1a-Retificacao.pdf",
        "title": "FELUMA 2027 - Edital 019/2026, 1ª retificação",
        "pages": "45,49-50",
        "sha256": "5d39cc47707747229d5d62d5bb4e2952bf75506c86b57243cf2db6bf3c255f9f"
      }
    ],
    "checked_at": "2026-08-30",
    "record_hash": "ccec1d8210d41845a34ff7a2ae7d7909bba3927ad8f341f741b07bd00c6a0fad"
  },
  {
    "source_rule_id": "CURR-FELUMA-2027-DIRECT-TEACHING-ASSISTANT",
    "source_process_id": "2027-MG-FELUMA-FELUMA",
    "activity_codes": [
      "TEACHING_ASSISTANT"
    ],
    "title": "Monitoria ou Programa de Iniciação à Docência (PID)",
    "access_type": "DIRECT",
    "specialties_text": null,
    "source_item": "Anexo B, aproveitamento extracurricular, item 4",
    "status": "POINTS_CONFIRMED",
    "scoring": {
      "type": "FIXED",
      "points_per_unit": 0.6,
      "unit": "atividade",
      "max_points": 0.6,
      "max_units": 1,
      "description": "0,6 ponto pelo item cumprido; não multiplica por meses ou por monitorias."
    },
    "shared_caps": [
      {
        "code": "FELUMA-2027-DIRECT-EXTRACURRICULAR",
        "label": "Aproveitamento extracurricular na graduação em Medicina",
        "max_points": 2,
        "notes": "Teto conjunto de pesquisa, extensão, estágio, monitoria, ligas e voluntariado da seção."
      }
    ],
    "requirements": [
      "Atividade durante a graduação em Medicina, por pelo menos 3 meses consecutivos.",
      "Um único certificado ou declaração institucional deve comprovar integralmente o período mínimo, sem somar documentos de períodos diferentes.",
      "Documento emitido por IES em papel timbrado, com candidato, disciplina, mês/ano de início e término e carga horária total ou semanal.",
      "Assinatura e identificação da autoridade responsável ou representante oficial; declarações pessoais sem identificação institucional oficial não bastam."
    ],
    "caveats": [
      "A seção pontua o mesmo documento uma só vez, no item válido de maior valor.",
      "Referência temporal dos documentos: último dia de inscrição. A carga horária deve ser informada, mas o item não fixa mínimo numérico de horas."
    ],
    "evidence": [
      {
        "url": "https://residencia.cmmg.edu.br/wp-content/uploads/2026/07/Edital-de-Inscricao-019-2026-Residencia-Medica-2027-1a-Retificacao.pdf",
        "title": "FELUMA 2027 - Edital 019/2026, 1ª retificação",
        "pages": "45,49,53",
        "sha256": "5d39cc47707747229d5d62d5bb4e2952bf75506c86b57243cf2db6bf3c255f9f"
      }
    ],
    "checked_at": "2026-08-30",
    "record_hash": "d3fe55f7f3ac57f2a5f8418758f58a666d3b4ee40ecf38e07f51369e68e10dd0"
  },
  {
    "source_rule_id": "CURR-FELUMA-2027-PREREQUISITE-BOOK-ORGANIZER",
    "source_process_id": "2027-MG-FELUMA-FELUMA",
    "activity_codes": [
      "BOOK_ORGANIZER"
    ],
    "title": "Organização de livro publicado",
    "access_type": "PREREQUISITE",
    "specialties_text": null,
    "source_item": "Anexo B, publicação de trabalhos científicos, itens 5 e 6",
    "status": "POINTS_CONFIRMED",
    "scoring": {
      "type": "PER_UNIT",
      "points_per_unit": 1.5,
      "unit": "livro",
      "max_points": 3,
      "max_units": 2,
      "description": "1,5 ponto por livro organizado, até dois livros; sujeito ao teto conjunto das publicações."
    },
    "shared_caps": [
      {
        "code": "FELUMA-2027-PREREQUISITE-PUBLICATIONS",
        "label": "Publicação de trabalhos científicos - pré-requisito",
        "max_points": 3,
        "notes": "Compartilhado com artigos e capítulos; cada publicação só pode pontuar uma vez."
      }
    ],
    "requirements": [
      "Livro efetivamente publicado e com ISBN; o candidato deve constar como organizador.",
      "Anexar PDF com capa, ficha catalográfica e sumário, identificando candidato como organizador, título, ISBN, edição, data e editora."
    ],
    "caveats": [
      "Autoria, coautoria e outras denominações não substituem a identificação como organizador.",
      "Certificados, declarações, cartas ou e-mails de aceite não comprovam publicação do livro.",
      "Organização de livro e autoria de capítulo são categorias distintas na fonte."
    ],
    "evidence": [
      {
        "url": "https://residencia.cmmg.edu.br/wp-content/uploads/2026/07/Edital-de-Inscricao-019-2026-Residencia-Medica-2027-1a-Retificacao.pdf",
        "title": "FELUMA 2027 - Edital 019/2026, 1ª retificação",
        "pages": "45,82,85",
        "sha256": "5d39cc47707747229d5d62d5bb4e2952bf75506c86b57243cf2db6bf3c255f9f"
      }
    ],
    "checked_at": "2026-08-30",
    "record_hash": "b6d7499a3932cc2a5dc3c31de00ed2a7c719f28d5ae2c3c26cf514cd68134770"
  },
  {
    "source_rule_id": "CURR-FELUMA-2027-PREREQUISITE-EVENT-ORGANIZER",
    "source_process_id": "2027-MG-FELUMA-FELUMA",
    "activity_codes": [
      "EVENT_ORGANIZER"
    ],
    "title": "Comissão organizadora de evento científico",
    "access_type": "PREREQUISITE",
    "specialties_text": null,
    "source_item": "Anexo B, eventos científicos e premiações, itens 1 e 2",
    "status": "POINTS_CONFIRMED",
    "scoring": {
      "type": "PER_UNIT",
      "points_per_unit": 0.5,
      "unit": "documento",
      "max_points": 1,
      "max_units": 2,
      "description": "0,5 ponto por documento de participação na comissão organizadora, até dois documentos."
    },
    "shared_caps": [
      {
        "code": "FELUMA-2027-PREREQUISITE-EVENTS",
        "label": "Eventos científicos e premiações - pré-requisito",
        "max_points": 2,
        "notes": "Teto conjunto de palestras, organização, apresentação de trabalhos e premiações; organização isolada continua limitada a 1 ponto."
      }
    ],
    "requirements": [
      "Participação na comissão organizadora de evento científico regional, nacional ou internacional.",
      "A fonte contempla congressos e outras modalidades científicas, como simpósios, jornadas, seminários, palestras e semanas acadêmicas/científicas.",
      "Certificado ou declaração em papel timbrado da instituição organizadora/promotora ou do evento, com candidato, evento, entidades, papel desempenhado, data/período e assinatura/identificação dos responsáveis."
    ],
    "caveats": [
      "Colaborador, secretário e coordenador de mesa não equivalem ao papel de organizador; a natureza da participação deve estar identificada.",
      "O limite de 2 pontos da seção não é o limite individual da atividade: organização possui apenas dois documentos de 0,5 ponto."
    ],
    "evidence": [
      {
        "url": "https://residencia.cmmg.edu.br/wp-content/uploads/2026/07/Edital-de-Inscricao-019-2026-Residencia-Medica-2027-1a-Retificacao.pdf",
        "title": "FELUMA 2027 - Edital 019/2026, 1ª retificação",
        "pages": "45,86-87",
        "sha256": "5d39cc47707747229d5d62d5bb4e2952bf75506c86b57243cf2db6bf3c255f9f"
      }
    ],
    "checked_at": "2026-08-30",
    "record_hash": "cd818bcf260370f51ea5b1e925fc3472cbdd9d7bf9b5611ee552dc27d8cda022"
  },
  {
    "source_rule_id": "CURR-FELUMA-2027-PREREQUISITE-EVENT-SPEAKER",
    "source_process_id": "2027-MG-FELUMA-FELUMA",
    "activity_codes": [
      "EVENT_SPEAKER"
    ],
    "title": "Palestrante em evento científico",
    "access_type": "PREREQUISITE",
    "specialties_text": null,
    "source_item": "Anexo B, eventos científicos e premiações, itens 5 e 6",
    "status": "POINTS_CONFIRMED",
    "scoring": {
      "type": "PER_UNIT",
      "points_per_unit": 0.5,
      "unit": "documento",
      "max_points": 1,
      "max_units": 2,
      "description": "0,5 ponto por documento de participação como palestrante, até dois documentos."
    },
    "shared_caps": [
      {
        "code": "FELUMA-2027-PREREQUISITE-EVENTS",
        "label": "Eventos científicos e premiações - pré-requisito",
        "max_points": 2,
        "notes": "Teto conjunto de palestras, organização, apresentação de trabalhos e premiações; palestras isoladas continuam limitadas a 1 ponto."
      }
    ],
    "requirements": [
      "Atuação como palestrante em evento científico regional, nacional ou internacional.",
      "A fonte contempla congressos e outras modalidades científicas, como simpósios, jornadas, seminários, palestras e semanas acadêmicas/científicas.",
      "Certificado ou declaração em papel timbrado da instituição organizadora/promotora ou do evento, com candidato, evento, entidades, papel desempenhado, data/período e assinatura/identificação dos responsáveis."
    ],
    "caveats": [
      "Colaborador, secretário e coordenador de mesa não equivalem a palestrante; a natureza da participação deve estar identificada no documento.",
      "Não confundir palestra com apresentação de trabalho, que é outro item da mesma seção."
    ],
    "evidence": [
      {
        "url": "https://residencia.cmmg.edu.br/wp-content/uploads/2026/07/Edital-de-Inscricao-019-2026-Residencia-Medica-2027-1a-Retificacao.pdf",
        "title": "FELUMA 2027 - Edital 019/2026, 1ª retificação",
        "pages": "45,86-87",
        "sha256": "5d39cc47707747229d5d62d5bb4e2952bf75506c86b57243cf2db6bf3c255f9f"
      }
    ],
    "checked_at": "2026-08-30",
    "record_hash": "a37efd70741398be41f9c05eece7d5da0e5fd5f9baeb27da208a4ee88e4df6b5"
  },
  {
    "source_rule_id": "CURR-FMUSP-2026-DIRECT-IC-BOLSA-ARTIGO",
    "source_process_id": "2026-SP-FMUSP-FUVEST",
    "activity_codes": [
      "RESEARCH"
    ],
    "title": "Iniciação científica com bolsa e artigo relacionado aceito",
    "access_type": "DIRECT",
    "specialties_text": null,
    "source_item": "2.4 - item 5, participação com bolsa, alínea a",
    "status": "POINTS_CONFIRMED",
    "scoring": {
      "type": "PER_UNIT",
      "points_per_unit": 6,
      "unit": "projeto",
      "max_points": 12,
      "max_units": 2,
      "description": "6 pontos por projeto; até 2 projetos e 12 pontos."
    },
    "shared_caps": [
      {
        "code": "CURR-FMUSP-2026-DIRECT-ITEM-5",
        "label": "Iniciação científica com ou sem bolsa - item 5",
        "max_points": 12
      }
    ],
    "requirements": [
      "Participação com bolsa documentada pelo órgão emissor.",
      "Projeto com 2 ou mais semestres letivos e artigo científico relacionado aceito para publicação.",
      "Certificação da instituição formadora com a carga horária cumprida."
    ],
    "caveats": [
      "Apenas possuir artigo não comprova vínculo com o projeto de iniciação científica.",
      "Não somar automaticamente as variantes do item 5 para o mesmo projeto.",
      "A publicação pontuada separadamente no item 6 deve ser diferente da usada no item 5.",
      "A observação sobre submissão/publicação da p. 27 está no bloco sem bolsa; não substitui automaticamente o aceite exigido nesta alínea."
    ],
    "evidence": [
      {
        "url": "https://www.fuvest.br/wp-content/uploads/rm2026_edital_03-2025.pdf",
        "title": "FMUSP - Edital COREME/FM nº 03/2025, ingresso 2026",
        "pages": "26-27",
        "sha256": "9718c5ea35c5b16248ed317679cbcac4975089d7aeb36e8d05409b06df0dc3dd"
      }
    ],
    "checked_at": "2026-08-30",
    "record_hash": "eed275abe9527d38ab5a1d1b949f662056ad6fb47186ccd37629dc45a2ce14fd"
  },
  {
    "source_rule_id": "CURR-FMUSP-2026-DIRECT-IC-BOLSA-DURACAO",
    "source_process_id": "2026-SP-FMUSP-FUVEST",
    "activity_codes": [
      "RESEARCH"
    ],
    "title": "Iniciação científica com bolsa - faixa de 2 semestres",
    "access_type": "DIRECT",
    "specialties_text": null,
    "source_item": "2.4 - item 5, participação com bolsa, alínea b",
    "status": "POINTS_CONFIRMED",
    "scoring": {
      "type": "PER_UNIT",
      "points_per_unit": 2,
      "unit": "projeto",
      "max_points": 4,
      "max_units": 2,
      "description": "2 pontos por projeto na faixa de 2 semestres; até 2 projetos e 4 pontos."
    },
    "shared_caps": [
      {
        "code": "CURR-FMUSP-2026-DIRECT-ITEM-5",
        "label": "Iniciação científica com ou sem bolsa - item 5",
        "max_points": 12
      }
    ],
    "requirements": [
      "Participação com bolsa documentada pelo órgão emissor.",
      "A alínea especifica 2 semestres letivos.",
      "Certificação da instituição formadora contendo carga horária cumprida."
    ],
    "caveats": [
      "Esta alínea não exige explicitamente artigo; não é a variante de 6 pontos com artigo aceito.",
      "Não somar automaticamente esta variante à de artigo aceito para o mesmo projeto.",
      "Não estender a faixa a outras durações por inferência."
    ],
    "evidence": [
      {
        "url": "https://www.fuvest.br/wp-content/uploads/rm2026_edital_03-2025.pdf",
        "title": "FMUSP - Edital COREME/FM nº 03/2025, ingresso 2026",
        "pages": "26-27",
        "sha256": "9718c5ea35c5b16248ed317679cbcac4975089d7aeb36e8d05409b06df0dc3dd"
      }
    ],
    "checked_at": "2026-08-30",
    "record_hash": "2ddcbd0305e903aa73148ffbe4e661871744a079ff4e4d42322fc95ef500f96a"
  },
  {
    "source_rule_id": "CURR-FMUSP-2026-DIRECT-IC-SEM-BOLSA-ARTIGO",
    "source_process_id": "2026-SP-FMUSP-FUVEST",
    "activity_codes": [
      "RESEARCH"
    ],
    "title": "Iniciação científica sem bolsa e artigo relacionado - conferir estado do artigo",
    "access_type": "DIRECT",
    "specialties_text": null,
    "source_item": "2.4 - item 5, participação sem bolsa, alínea a e observação 2",
    "status": "REVIEW_REQUIRED",
    "scoring": {
      "type": "MANUAL",
      "points_per_unit": null,
      "unit": "projeto",
      "max_points": 8,
      "max_units": 2,
      "description": "A tabela prevê 4 pontos por projeto, até 2 projetos e 8 pontos; aplicação manual pela divergência entre aceite/publicação na alínea e submissão/publicação na comprovação."
    },
    "shared_caps": [
      {
        "code": "CURR-FMUSP-2026-DIRECT-ITEM-5",
        "label": "Iniciação científica com ou sem bolsa - item 5",
        "max_points": 12
      }
    ],
    "requirements": [
      "Iniciação científica sem bolsa com 2 ou mais semestres letivos, documentada pela instituição.",
      "Artigo relacionado ao projeto e identificação do candidato entre os autores.",
      "A observação 2 especifica periódico indexado em SciELO ou PubMed.",
      "Certificação com tempo e carga horária; na hipótese prevista, relatório de atividades e horas assinado pelo orientador ou responsável."
    ],
    "caveats": [
      "A alínea exige aceitação/publicação, enquanto a observação 2 menciona registro de submissão/publicação; submissão não foi normalizada como aceite.",
      "Sem cálculo automático enquanto a condição conflitante não for esclarecida.",
      "Não somar automaticamente variantes para o mesmo projeto; artigo do item 6 precisa ser diferente do utilizado no item 5."
    ],
    "evidence": [
      {
        "url": "https://www.fuvest.br/wp-content/uploads/rm2026_edital_03-2025.pdf",
        "title": "FMUSP - Edital COREME/FM nº 03/2025, ingresso 2026",
        "pages": "26-27",
        "sha256": "9718c5ea35c5b16248ed317679cbcac4975089d7aeb36e8d05409b06df0dc3dd"
      }
    ],
    "checked_at": "2026-08-30",
    "record_hash": "a0e2899b2b46f623c2c4a80334b833f7334172247dda5642bb1cc3244aec028c"
  },
  {
    "source_rule_id": "CURR-FMUSP-2026-DIRECT-IC-SEM-BOLSA-DURACAO",
    "source_process_id": "2026-SP-FMUSP-FUVEST",
    "activity_codes": [
      "RESEARCH"
    ],
    "title": "Iniciação científica sem bolsa - conferir comprovação da faixa de 2 semestres",
    "access_type": "DIRECT",
    "specialties_text": null,
    "source_item": "2.4 - item 5, participação sem bolsa, alínea b e observação 2",
    "status": "REVIEW_REQUIRED",
    "scoring": {
      "type": "MANUAL",
      "points_per_unit": null,
      "unit": "projeto",
      "max_points": 2,
      "max_units": 2,
      "description": "A tabela prevê 1 ponto por projeto de 2 semestres, até 2 projetos e 2 pontos; conferir se a observação sobre artigo também se aplica a esta faixa."
    },
    "shared_caps": [
      {
        "code": "CURR-FMUSP-2026-DIRECT-ITEM-5",
        "label": "Iniciação científica com ou sem bolsa - item 5",
        "max_points": 12
      }
    ],
    "requirements": [
      "Iniciação científica sem bolsa documentada pela instituição, na faixa textual de 2 semestres letivos.",
      "Certificação com tempo e carga horária; na hipótese prevista, relatório assinado pelo orientador ou responsável."
    ],
    "caveats": [
      "A alínea b menciona duração, sem artigo, mas a observação 2 do mesmo bloco exige submissão/publicação em SciELO ou PubMed e autoria identificável. O alcance dessa observação não foi resolvido por inferência.",
      "Sem cálculo automático até esclarecer a documentação aplicável.",
      "Não acumular automaticamente com a variante de artigo relacionado para o mesmo projeto."
    ],
    "evidence": [
      {
        "url": "https://www.fuvest.br/wp-content/uploads/rm2026_edital_03-2025.pdf",
        "title": "FMUSP - Edital COREME/FM nº 03/2025, ingresso 2026",
        "pages": "26-27",
        "sha256": "9718c5ea35c5b16248ed317679cbcac4975089d7aeb36e8d05409b06df0dc3dd"
      }
    ],
    "checked_at": "2026-08-30",
    "record_hash": "8b18e74592b144db9bb67fc0ce79ddb09b522c7b134d08e6ff7c5604c51dc50f"
  },
  {
    "source_rule_id": "CURR-FMUSP-2026-DIRECT-MONITORIA",
    "source_process_id": "2026-SP-FMUSP-FUVEST",
    "activity_codes": [
      "TEACHING_ASSISTANT"
    ],
    "title": "Monitoria conforme duração e carga horária",
    "access_type": "DIRECT",
    "specialties_text": null,
    "source_item": "2.4 - item 4, áreas básicas e acesso direto",
    "status": "POINTS_CONFIRMED",
    "scoring": {
      "type": "TIERS",
      "points_per_unit": null,
      "unit": "faixa de duração e carga horária",
      "max_points": 3,
      "max_units": null,
      "tiers": [
        {
          "label": "1 semestre letivo na mesma monitoria e pelo menos 64 horas totais",
          "points": 1
        },
        {
          "label": "2 semestres letivos na mesma monitoria e pelo menos 128 horas totais",
          "points": 2
        },
        {
          "label": "Mais de 2 semestres letivos na mesma monitoria e pelo menos 192 horas totais",
          "points": 3
        }
      ],
      "description": "Faixas de 1, 2 ou 3 pontos; teto de 3 pontos no item de monitoria."
    },
    "shared_caps": [
      {
        "code": "CURR-FMUSP-2026-DIRECT-ITEM-4",
        "label": "Monitoria - item 4",
        "max_points": 3
      }
    ],
    "requirements": [
      "Atender simultaneamente à duração e à carga horária total da faixa, na mesma monitoria.",
      "Certificação da instituição de ensino com período e horas cumpridas, assinada pelo Serviço Acadêmico."
    ],
    "caveats": [
      "As faixas não são parcelas automaticamente somáveis para a mesma monitoria.",
      "Regra extraída do barema de áreas básicas e acesso direto; não transportar para pré-requisitos."
    ],
    "evidence": [
      {
        "url": "https://www.fuvest.br/wp-content/uploads/rm2026_edital_03-2025.pdf",
        "title": "FMUSP - Edital COREME/FM nº 03/2025, ingresso 2026",
        "pages": "25-26",
        "sha256": "9718c5ea35c5b16248ed317679cbcac4975089d7aeb36e8d05409b06df0dc3dd"
      }
    ],
    "checked_at": "2026-08-30",
    "record_hash": "168c9b92af2ba75e0442458946b23c1e119dc58d644cdc0d327ba72e71ce61ae"
  },
  {
    "source_rule_id": "CURR-FMUSP-2026-DIRECT-ORGANIZACAO-CONGRESSO-CLASSE",
    "source_process_id": "2026-SP-FMUSP-FUVEST",
    "activity_codes": [
      "EVENT_ORGANIZER"
    ],
    "title": "Organização de congresso de entidade profissional de classe",
    "access_type": "DIRECT",
    "specialties_text": null,
    "source_item": "2.4 - item 7, alínea a, retificado em 11/12/2025",
    "status": "POINTS_CONFIRMED",
    "scoring": {
      "type": "PER_UNIT",
      "points_per_unit": 5,
      "unit": "atividade",
      "max_points": 5,
      "max_units": 1,
      "description": "5 pontos por organização de congresso elegível; no máximo 1 atividade."
    },
    "shared_caps": [
      {
        "code": "CURR-FMUSP-2026-DIRECT-ITEM-7",
        "label": "Organização e participação em congressos ou afins - item 7",
        "max_points": 6,
        "notes": "Compartilhado com organização acadêmica e participação em eventos do mesmo item."
      }
    ],
    "requirements": [
      "Congresso estadual, nacional ou internacional organizado por entidade profissional de classe.",
      "Certificado discriminando atividade realizada, tipo de evento e entidade organizadora."
    ],
    "caveats": [
      "A errata de 11/12/2025 substitui os 4 pontos do edital original por 5 apenas no barema de acesso direto.",
      "Ser participante ou palestrante não comprova a função de organizador."
    ],
    "evidence": [
      {
        "url": "https://www.fuvest.br/wp-content/uploads/rm2026_edital_03-2025.pdf",
        "title": "FMUSP - Edital COREME/FM nº 03/2025, ingresso 2026",
        "pages": "25, 27",
        "sha256": "9718c5ea35c5b16248ed317679cbcac4975089d7aeb36e8d05409b06df0dc3dd"
      },
      {
        "url": "https://www.fuvest.br/wp-content/uploads/rm2026-retificacao-2025-12-11.pdf",
        "title": "FMUSP - Errata COREME/FM 02/2025, de 11/12/2025",
        "pages": "1",
        "sha256": "493642db3458e135cf4c5b8b43750d762cda09ddc8c253f07bb0d29582bf0ac4"
      }
    ],
    "checked_at": "2026-08-30",
    "record_hash": "7aa58c9bbe107231600cb3e09d00c4e0756a7408d0cfb79d2032a320deac8cf6"
  },
  {
    "source_rule_id": "CURR-FMUSP-2026-DIRECT-ORGANIZACAO-EVENTO-ACADEMICO",
    "source_process_id": "2026-SP-FMUSP-FUVEST",
    "activity_codes": [
      "EVENT_ORGANIZER"
    ],
    "title": "Organização de encontros, jornadas ou eventos acadêmicos",
    "access_type": "DIRECT",
    "specialties_text": null,
    "source_item": "2.4 - item 7, alínea b, retificado em 11/12/2025",
    "status": "POINTS_CONFIRMED",
    "scoring": {
      "type": "PER_UNIT",
      "points_per_unit": 1,
      "unit": "atividade",
      "max_points": 3,
      "max_units": 3,
      "description": "1 ponto por atividade de organização acadêmica; no máximo 3 atividades e 3 pontos."
    },
    "shared_caps": [
      {
        "code": "CURR-FMUSP-2026-DIRECT-ITEM-7",
        "label": "Organização e participação em congressos ou afins - item 7",
        "max_points": 6,
        "notes": "Compartilhado com organização de congressos profissionais e participação em eventos do mesmo item."
      }
    ],
    "requirements": [
      "Organização de encontro, jornada científica ou evento realizado por liga, estudantes ou diretório acadêmico.",
      "Certificado discriminando atividade realizada, tipo de evento e entidade organizadora."
    ],
    "caveats": [
      "A errata de 11/12/2025 define 1 ponto por atividade e máximo de 3; vale somente para acesso direto.",
      "Não confundir com a pontuação por simples participação, que é outro subitem."
    ],
    "evidence": [
      {
        "url": "https://www.fuvest.br/wp-content/uploads/rm2026_edital_03-2025.pdf",
        "title": "FMUSP - Edital COREME/FM nº 03/2025, ingresso 2026",
        "pages": "25, 27",
        "sha256": "9718c5ea35c5b16248ed317679cbcac4975089d7aeb36e8d05409b06df0dc3dd"
      },
      {
        "url": "https://www.fuvest.br/wp-content/uploads/rm2026-retificacao-2025-12-11.pdf",
        "title": "FMUSP - Errata COREME/FM 02/2025, de 11/12/2025",
        "pages": "1",
        "sha256": "493642db3458e135cf4c5b8b43750d762cda09ddc8c253f07bb0d29582bf0ac4"
      }
    ],
    "checked_at": "2026-08-30",
    "record_hash": "eaa84cbb67b6959fe2c0e1143759c76a7e53cbc8179edf97d5e072f22cf58349"
  },
  {
    "source_rule_id": "CURR-HCPA-2027-DIRECT-EXTENSAO",
    "source_process_id": "2027-RS-HCPA-FUNDMED",
    "activity_codes": [
      "EXTENSION_PROJECT"
    ],
    "title": "Projeto de extensão com pelo menos dois semestres",
    "access_type": "DIRECT",
    "specialties_text": null,
    "source_item": "Anexo III - acesso direto, item G, projetos de extensão",
    "status": "POINTS_CONFIRMED",
    "scoring": {
      "type": "PER_UNIT",
      "points_per_unit": 0.1,
      "unit": "projeto",
      "max_points": 0.5,
      "max_units": null,
      "description": "0,1 ponto por projeto elegível; teto próprio de 0,5 ponto."
    },
    "shared_caps": [
      {
        "code": "CURR-HCPA-2027-DIRECT-ITEM-G",
        "label": "Monitorias, projetos e iniciação científica - item G",
        "max_points": 2,
        "notes": "Teto conjunto, incluindo as ligas acadêmicas previstas no mesmo item."
      }
    ],
    "requirements": [
      "Participação por período mínimo de dois semestres letivos.",
      "Certificação da instituição de ensino com cadastro junto à Pró-Reitoria e nome do candidato.",
      "Na ausência do certificado, a fonte admite relatório de atividades com nome do candidato e assinatura do professor orientador ou responsável indicado."
    ],
    "caveats": [
      "A unidade é projeto, não semestre.",
      "O documento usa a expressão responsável pela iniciação científica ao descrever o relatório alternativo de extensão; preservar a redação e conferir a autoridade signatária adequada.",
      "Regra exclusiva do barema de acesso direto."
    ],
    "evidence": [
      {
        "url": "https://fundmed.org.br/website/wp-content/uploads/2026/08/HCPA-MEDICA-Edital-de-Abertura-das-Inscricoes-1.pdf",
        "title": "HCPA - Edital nº 01, residência médica 2027",
        "pages": "50-51",
        "sha256": "0f421dbde11c3385906d896a8bd1bff660ed5c92bee256eff81635b49f9984b1"
      }
    ],
    "checked_at": "2026-08-30",
    "record_hash": "ca86427ffbe6db0ae9c59f4acc0a9d35a93f136cd26aa91d0ce2d0132c8ab812"
  },
  {
    "source_rule_id": "CURR-HCPA-2027-DIRECT-IC-BOLSA",
    "source_process_id": "2027-RS-HCPA-FUNDMED",
    "activity_codes": [
      "RESEARCH"
    ],
    "title": "Iniciação científica com bolsa",
    "access_type": "DIRECT",
    "specialties_text": null,
    "source_item": "Anexo III - acesso direto, item G, projeto de pesquisa/iniciação científica",
    "status": "POINTS_CONFIRMED",
    "scoring": {
      "type": "PER_UNIT",
      "points_per_unit": 0.3,
      "unit": "semestre",
      "max_points": 0.9,
      "max_units": null,
      "description": "0,3 ponto por semestre de iniciação científica com bolsa; teto próprio de 0,9 ponto."
    },
    "shared_caps": [
      {
        "code": "CURR-HCPA-2027-DIRECT-ITEM-G",
        "label": "Monitorias, projetos e iniciação científica - item G",
        "max_points": 2,
        "notes": "Teto conjunto, incluindo as ligas acadêmicas previstas no mesmo item."
      }
    ],
    "requirements": [
      "Iniciação científica com bolsa, enquadrada no período formativo do barema.",
      "Comprovação identificando o candidato, conforme as observações gerais do Anexo III."
    ],
    "caveats": [
      "Se pontuar como bolsista, a fonte impede pontuação também no item projeto.",
      "Não converter a pontuação por semestre em pontuação por projeto.",
      "Regra exclusiva do barema de acesso direto."
    ],
    "evidence": [
      {
        "url": "https://fundmed.org.br/website/wp-content/uploads/2026/08/HCPA-MEDICA-Edital-de-Abertura-das-Inscricoes-1.pdf",
        "title": "HCPA - Edital nº 01, residência médica 2027",
        "pages": "50-51",
        "sha256": "0f421dbde11c3385906d896a8bd1bff660ed5c92bee256eff81635b49f9984b1"
      }
    ],
    "checked_at": "2026-08-30",
    "record_hash": "a61176764ecd3760672be11b503481fe471013c9d02422f49d27de7812123908"
  },
  {
    "source_rule_id": "CURR-HCPA-2027-DIRECT-IC-SEM-BOLSA",
    "source_process_id": "2027-RS-HCPA-FUNDMED",
    "activity_codes": [
      "RESEARCH"
    ],
    "title": "Iniciação científica sem bolsa",
    "access_type": "DIRECT",
    "specialties_text": null,
    "source_item": "Anexo III - acesso direto, item G, projeto de pesquisa/iniciação científica",
    "status": "POINTS_CONFIRMED",
    "scoring": {
      "type": "PER_UNIT",
      "points_per_unit": 0.2,
      "unit": "semestre",
      "max_points": 0.6,
      "max_units": null,
      "description": "0,2 ponto por semestre de iniciação científica sem bolsa; teto próprio de 0,6 ponto."
    },
    "shared_caps": [
      {
        "code": "CURR-HCPA-2027-DIRECT-ITEM-G",
        "label": "Monitorias, projetos e iniciação científica - item G",
        "max_points": 2,
        "notes": "Teto conjunto, incluindo as ligas acadêmicas previstas no mesmo item."
      }
    ],
    "requirements": [
      "Iniciação científica sem bolsa, enquadrada no período formativo do barema.",
      "Comprovação identificando o candidato, conforme as observações gerais do Anexo III."
    ],
    "caveats": [
      "Se pontuar como bolsista, a fonte impede pontuação também no item projeto.",
      "Não converter a pontuação por semestre em pontuação por projeto.",
      "Regra exclusiva do barema de acesso direto."
    ],
    "evidence": [
      {
        "url": "https://fundmed.org.br/website/wp-content/uploads/2026/08/HCPA-MEDICA-Edital-de-Abertura-das-Inscricoes-1.pdf",
        "title": "HCPA - Edital nº 01, residência médica 2027",
        "pages": "50-51",
        "sha256": "0f421dbde11c3385906d896a8bd1bff660ed5c92bee256eff81635b49f9984b1"
      }
    ],
    "checked_at": "2026-08-30",
    "record_hash": "f4fa262c09f2c01c9497bf0018f782462a653fa220cae125ee84f6d853ae2910"
  },
  {
    "source_rule_id": "CURR-HCPA-2027-DIRECT-MONITORIA-CONSECUTIVA",
    "source_process_id": "2027-RS-HCPA-FUNDMED",
    "activity_codes": [
      "TEACHING_ASSISTANT"
    ],
    "title": "Mesma monitoria em semestres consecutivos",
    "access_type": "DIRECT",
    "specialties_text": null,
    "source_item": "Anexo III - acesso direto, item G, monitorias, terceira linha",
    "status": "POINTS_CONFIRMED",
    "scoring": {
      "type": "PER_UNIT",
      "points_per_unit": 0.3,
      "unit": "semestre letivo concluído",
      "max_points": 0.9,
      "max_units": null,
      "description": "0,3 ponto por semestre concluído, em semestres consecutivos na mesma monitoria; teto próprio de 0,9 ponto."
    },
    "shared_caps": [
      {
        "code": "CURR-HCPA-2027-DIRECT-ITEM-G",
        "label": "Monitorias, projetos e iniciação científica - item G",
        "max_points": 2,
        "notes": "Teto conjunto, incluindo as ligas acadêmicas previstas no mesmo item."
      }
    ],
    "requirements": [
      "Semestres letivos consecutivos e concluídos na mesma monitoria.",
      "Certificação emitida pela instituição de ensino, com cadastro junto à Pró-Reitoria e identificação do candidato."
    ],
    "caveats": [
      "Não acumular automaticamente com as outras linhas de monitoria para o mesmo período.",
      "Regra exclusiva do barema de acesso direto."
    ],
    "evidence": [
      {
        "url": "https://fundmed.org.br/website/wp-content/uploads/2026/08/HCPA-MEDICA-Edital-de-Abertura-das-Inscricoes-1.pdf",
        "title": "HCPA - Edital nº 01, residência médica 2027",
        "pages": "50-51",
        "sha256": "0f421dbde11c3385906d896a8bd1bff660ed5c92bee256eff81635b49f9984b1"
      }
    ],
    "checked_at": "2026-08-30",
    "record_hash": "4a23ae84673c0286a65f3fe5d48cd6dcc358a05388f8c84e2306ad4d26d27eca"
  },
  {
    "source_rule_id": "CURR-HCPA-2027-DIRECT-MONITORIA-SEMESTRE",
    "source_process_id": "2027-RS-HCPA-FUNDMED",
    "activity_codes": [
      "TEACHING_ASSISTANT"
    ],
    "title": "Monitoria por semestre letivo",
    "access_type": "DIRECT",
    "specialties_text": null,
    "source_item": "Anexo III - acesso direto, item G, monitorias, segunda linha",
    "status": "POINTS_CONFIRMED",
    "scoring": {
      "type": "PER_UNIT",
      "points_per_unit": 0.2,
      "unit": "semestre letivo",
      "max_points": 0.6,
      "max_units": null,
      "description": "0,2 ponto por semestre letivo de monitoria; teto próprio de 0,6 ponto."
    },
    "shared_caps": [
      {
        "code": "CURR-HCPA-2027-DIRECT-ITEM-G",
        "label": "Monitorias, projetos e iniciação científica - item G",
        "max_points": 2,
        "notes": "Teto conjunto, incluindo as ligas acadêmicas previstas no mesmo item."
      }
    ],
    "requirements": [
      "Monitoria no período formativo abrangido pelo barema de acesso direto.",
      "Certificação emitida pela instituição de ensino, com cadastro junto à Pró-Reitoria e identificação do candidato."
    ],
    "caveats": [
      "A linha da fonte não especifica bolsa; não foi convertida para monitoria remunerada.",
      "A fonte apresenta linha própria para voluntária e para semestres consecutivos. Conferir o enquadramento e não acumular automaticamente variantes para o mesmo fato.",
      "Regra exclusiva do barema de acesso direto."
    ],
    "evidence": [
      {
        "url": "https://fundmed.org.br/website/wp-content/uploads/2026/08/HCPA-MEDICA-Edital-de-Abertura-das-Inscricoes-1.pdf",
        "title": "HCPA - Edital nº 01, residência médica 2027",
        "pages": "50-51",
        "sha256": "0f421dbde11c3385906d896a8bd1bff660ed5c92bee256eff81635b49f9984b1"
      }
    ],
    "checked_at": "2026-08-30",
    "record_hash": "73bac456be5425f5fa0a46564d41684600e201608bc84434a1c81a63e79beeb8"
  },
  {
    "source_rule_id": "CURR-HCPA-2027-DIRECT-MONITORIA-VOLUNTARIA",
    "source_process_id": "2027-RS-HCPA-FUNDMED",
    "activity_codes": [
      "TEACHING_ASSISTANT"
    ],
    "title": "Monitoria voluntária",
    "access_type": "DIRECT",
    "specialties_text": null,
    "source_item": "Anexo III - acesso direto, item G, monitorias, primeira linha",
    "status": "POINTS_CONFIRMED",
    "scoring": {
      "type": "PER_UNIT",
      "points_per_unit": 0.1,
      "unit": "semestre letivo",
      "max_points": 0.3,
      "max_units": null,
      "description": "0,1 ponto por semestre letivo de monitoria voluntária; teto próprio de 0,3 ponto."
    },
    "shared_caps": [
      {
        "code": "CURR-HCPA-2027-DIRECT-ITEM-G",
        "label": "Monitorias, projetos e iniciação científica - item G",
        "max_points": 2,
        "notes": "Teto conjunto, incluindo as ligas acadêmicas previstas no mesmo item."
      }
    ],
    "requirements": [
      "Monitoria voluntária no período formativo abrangido pelo barema de acesso direto.",
      "Certificação emitida pela instituição de ensino, com cadastro junto à Pró-Reitoria e identificação do candidato."
    ],
    "caveats": [
      "Não acumular automaticamente as três variantes de monitoria para o mesmo período/atividade.",
      "Não transportar esta regra ao barema de pré-requisitos, que não contém o mesmo item G."
    ],
    "evidence": [
      {
        "url": "https://fundmed.org.br/website/wp-content/uploads/2026/08/HCPA-MEDICA-Edital-de-Abertura-das-Inscricoes-1.pdf",
        "title": "HCPA - Edital nº 01, residência médica 2027",
        "pages": "50-51",
        "sha256": "0f421dbde11c3385906d896a8bd1bff660ed5c92bee256eff81635b49f9984b1"
      }
    ],
    "checked_at": "2026-08-30",
    "record_hash": "e60f9e6c3467f67d82a0d9cdca7f8565245774587fb16f4158c8a85b07995904"
  },
  {
    "source_rule_id": "CURR-HCPA-2027-DIRECT-ORGANIZACAO-CONGRESSO-CLASSE",
    "source_process_id": "2027-RS-HCPA-FUNDMED",
    "activity_codes": [
      "EVENT_ORGANIZER"
    ],
    "title": "Organização de congresso de entidade profissional de classe",
    "access_type": "DIRECT",
    "specialties_text": null,
    "source_item": "Anexo III - acesso direto, item F, organização de eventos científicos",
    "status": "POINTS_CONFIRMED",
    "scoring": {
      "type": "PER_UNIT",
      "points_per_unit": 0.3,
      "unit": "evento",
      "max_points": 0.6,
      "max_units": null,
      "description": "0,3 ponto por congresso elegível organizado; teto próprio de 0,6 ponto."
    },
    "shared_caps": [
      {
        "code": "CURR-HCPA-2027-DIRECT-ITEM-F",
        "label": "Organização e participação em eventos - acesso direto, item F",
        "max_points": 1.2,
        "notes": "Teto compartilhado com organização acadêmica, participação, premiação e apresentação do mesmo item."
      }
    ],
    "requirements": [
      "Congresso internacional, nacional ou estadual organizado por entidade profissional de classe.",
      "Certificado com atividade realizada, tipo de evento e entidade organizadora."
    ],
    "caveats": [
      "Não confundir função de organização com participação ou apresentação.",
      "O teto coletivo deste barema é 1,2; no pré-requisito é diferente."
    ],
    "evidence": [
      {
        "url": "https://fundmed.org.br/website/wp-content/uploads/2026/08/HCPA-MEDICA-Edital-de-Abertura-das-Inscricoes-1.pdf",
        "title": "HCPA - Edital nº 01, residência médica 2027",
        "pages": "50-51",
        "sha256": "0f421dbde11c3385906d896a8bd1bff660ed5c92bee256eff81635b49f9984b1"
      }
    ],
    "checked_at": "2026-08-30",
    "record_hash": "0f50a37581ca27f7a717e5c50f006084a29df339a72c4afd7a867d03dab8e0a8"
  },
  {
    "source_rule_id": "CURR-HCPA-2027-DIRECT-ORGANIZACAO-EVENTO-ACADEMICO",
    "source_process_id": "2027-RS-HCPA-FUNDMED",
    "activity_codes": [
      "EVENT_ORGANIZER"
    ],
    "title": "Organização de encontros, jornadas ou eventos acadêmicos",
    "access_type": "DIRECT",
    "specialties_text": null,
    "source_item": "Anexo III - acesso direto, item F, organização de eventos científicos",
    "status": "POINTS_CONFIRMED",
    "scoring": {
      "type": "PER_UNIT",
      "points_per_unit": 0.2,
      "unit": "evento",
      "max_points": 0.4,
      "max_units": null,
      "description": "0,2 ponto por evento acadêmico elegível organizado; teto próprio de 0,4 ponto."
    },
    "shared_caps": [
      {
        "code": "CURR-HCPA-2027-DIRECT-ITEM-F",
        "label": "Organização e participação em eventos - acesso direto, item F",
        "max_points": 1.2,
        "notes": "Teto compartilhado com organização profissional, participação, premiação e apresentação do mesmo item."
      }
    ],
    "requirements": [
      "Organização de encontro, jornada científica ou evento realizado por liga, estudantes ou diretório acadêmico.",
      "Certificado com atividade realizada, tipo de evento e entidade organizadora."
    ],
    "caveats": [
      "Não confundir organização com simples participação.",
      "O teto coletivo deste barema é 1,2; no pré-requisito é diferente."
    ],
    "evidence": [
      {
        "url": "https://fundmed.org.br/website/wp-content/uploads/2026/08/HCPA-MEDICA-Edital-de-Abertura-das-Inscricoes-1.pdf",
        "title": "HCPA - Edital nº 01, residência médica 2027",
        "pages": "50-51",
        "sha256": "0f421dbde11c3385906d896a8bd1bff660ed5c92bee256eff81635b49f9984b1"
      }
    ],
    "checked_at": "2026-08-30",
    "record_hash": "f187d04fc66d7e8fd1511b2e6395bb95874c4c534baf2adea28a0c75dcde9f15"
  },
  {
    "source_rule_id": "CURR-HCPA-2027-PREREQUISITE-ORGANIZACAO-CONGRESSO-CLASSE",
    "source_process_id": "2027-RS-HCPA-FUNDMED",
    "activity_codes": [
      "EVENT_ORGANIZER"
    ],
    "title": "Organização de congresso de entidade profissional de classe",
    "access_type": "PREREQUISITE",
    "specialties_text": null,
    "source_item": "Anexo III - pré-requisitos, item E, organização de eventos científicos",
    "status": "POINTS_CONFIRMED",
    "scoring": {
      "type": "PER_UNIT",
      "points_per_unit": 0.3,
      "unit": "evento",
      "max_points": 0.6,
      "max_units": null,
      "description": "0,3 ponto por congresso elegível organizado; teto próprio de 0,6 ponto."
    },
    "shared_caps": [
      {
        "code": "CURR-HCPA-2027-PREREQUISITE-ITEM-E",
        "label": "Organização e participação em eventos - pré-requisitos, item E",
        "max_points": 2,
        "notes": "Teto compartilhado com organização acadêmica, participação, premiação e apresentação do mesmo item."
      }
    ],
    "requirements": [
      "Congresso internacional, nacional ou estadual organizado por entidade profissional de classe.",
      "Certificado com atividade realizada, tipo de evento, entidade organizadora e identificação do candidato.",
      "Observar o período formativo abrangido pelas observações gerais do barema de pré-requisitos."
    ],
    "caveats": [
      "Não confundir função de organização com participação ou apresentação.",
      "O teto coletivo é 2 neste barema, não o teto de 1,2 do acesso direto."
    ],
    "evidence": [
      {
        "url": "https://fundmed.org.br/website/wp-content/uploads/2026/08/HCPA-MEDICA-Edital-de-Abertura-das-Inscricoes-1.pdf",
        "title": "HCPA - Edital nº 01, residência médica 2027",
        "pages": "53",
        "sha256": "0f421dbde11c3385906d896a8bd1bff660ed5c92bee256eff81635b49f9984b1"
      }
    ],
    "checked_at": "2026-08-30",
    "record_hash": "1d4557478a98b4f55d3c0aca205e9af99ae795053c6b15a7fa1053daffded3be"
  },
  {
    "source_rule_id": "CURR-HCPA-2027-PREREQUISITE-ORGANIZACAO-EVENTO-ACADEMICO",
    "source_process_id": "2027-RS-HCPA-FUNDMED",
    "activity_codes": [
      "EVENT_ORGANIZER"
    ],
    "title": "Organização de encontros, jornadas ou eventos acadêmicos",
    "access_type": "PREREQUISITE",
    "specialties_text": null,
    "source_item": "Anexo III - pré-requisitos, item E, organização de eventos científicos",
    "status": "POINTS_CONFIRMED",
    "scoring": {
      "type": "PER_UNIT",
      "points_per_unit": 0.2,
      "unit": "evento",
      "max_points": 0.4,
      "max_units": null,
      "description": "0,2 ponto por evento acadêmico elegível organizado; teto próprio de 0,4 ponto."
    },
    "shared_caps": [
      {
        "code": "CURR-HCPA-2027-PREREQUISITE-ITEM-E",
        "label": "Organização e participação em eventos - pré-requisitos, item E",
        "max_points": 2,
        "notes": "Teto compartilhado com organização profissional, participação, premiação e apresentação do mesmo item."
      }
    ],
    "requirements": [
      "Organização de encontro, jornada científica ou evento realizado por liga, estudantes ou diretório acadêmico.",
      "Certificado com atividade realizada, tipo de evento, entidade organizadora e identificação do candidato.",
      "Observar o período formativo abrangido pelas observações gerais do barema de pré-requisitos."
    ],
    "caveats": [
      "Não confundir organização com simples participação.",
      "O teto coletivo é 2 neste barema, não o teto de 1,2 do acesso direto."
    ],
    "evidence": [
      {
        "url": "https://fundmed.org.br/website/wp-content/uploads/2026/08/HCPA-MEDICA-Edital-de-Abertura-das-Inscricoes-1.pdf",
        "title": "HCPA - Edital nº 01, residência médica 2027",
        "pages": "53",
        "sha256": "0f421dbde11c3385906d896a8bd1bff660ed5c92bee256eff81635b49f9984b1"
      }
    ],
    "checked_at": "2026-08-30",
    "record_hash": "10077f9743dd5820819d76996af91180d1d69d79ea45d668ae97f8e65ce66dc2"
  },
  {
    "source_rule_id": "CURR-HSRC-2027-DIRECT-EVENTOS",
    "source_process_id": "2027-ES-HSRC-IBEST",
    "activity_codes": [
      "EVENT_SPEAKER",
      "EVENT_ORGANIZER"
    ],
    "title": "Organização, palestra ou conferência em evento científico",
    "access_type": "DIRECT",
    "specialties_text": "Anestesiologia, Cirurgia Geral, Clínica Médica e Radiologia e Diagnóstico por Imagem",
    "source_item": "16.13 - item 2D; detalhamento 17.5.4",
    "status": "POINTS_CONFIRMED",
    "scoring": {
      "type": "PER_UNIT",
      "points_per_unit": 0.5,
      "unit": "participação qualificada em evento",
      "max_points": 1,
      "max_units": null,
      "description": "0,5 ponto pela participação qualificada; teto único de 1 ponto para todas as funções do item 2D."
    },
    "shared_caps": [
      {
        "code": "CURR-HSRC-2027-DIRECT-ITEM-2D",
        "label": "Item 2D - organização e participação qualificada",
        "max_points": 1,
        "notes": "Mesmo item para palestrante, conferencista, organizador, comissão organizadora, coordenador e integrante formal de mesa científica."
      },
      {
        "code": "CURR-HSRC-2027-DIRECT-BLOCO-2",
        "label": "Bloco 2 - experiência acadêmica/profissional",
        "max_points": 5
      }
    ],
    "requirements": [
      "Atuação como integrante de comissão organizadora, coordenador, organizador, palestrante, conferencista ou integrante formal de mesa científica.",
      "Evento na área médica/saúde.",
      "Evento comprovadamente científico, vinculado a instituição de ensino, em um dos formatos especificados na seção 17.5.4.",
      "Declaração/certificado oficial identifica candidato, função, evento, entidade promotora, período/carga horária e assinatura responsável."
    ],
    "caveats": [
      "A condição de simples participante não pontua neste item.",
      "Workshop somente é aceito dentro de evento científico previsto; curso de capacitação não identificado como evento científico não é equivalente.",
      "A comprovação de organização não pode ser reutilizada no item 2G de participante.",
      "Os filtros de palestrante e organizador encontram esta mesma regra, sem duplicar seu teto."
    ],
    "evidence": [
      {
        "url": "https://anexos-r2.selecao.net.br/uploads/729/concursos/67/anexos/ad859832-d6fe-4802-8714-a927508f1d26.pdf",
        "title": "AFECC/HSRC - Edital 1 de 25/08/2026, ingresso 2027",
        "pages": "1, 14-15, 18",
        "sha256": "c5e3b3ff6cbe49b0da6f86593cf65843dd3d8a08ff780762664da9b39d540c32"
      }
    ],
    "checked_at": "2026-08-30",
    "record_hash": "f70a69e4fb01bacba90b169f6f880e28cb65173be198ed0abbec917c39a58e95"
  },
  {
    "source_rule_id": "CURR-HSRC-2027-DIRECT-EXTENSAO",
    "source_process_id": "2027-ES-HSRC-IBEST",
    "activity_codes": [
      "EXTENSION_PROJECT"
    ],
    "title": "Projeto de extensão ou comunidade - conferir detalhamento agrupado",
    "access_type": "DIRECT",
    "specialties_text": "Anestesiologia, Cirurgia Geral, Clínica Médica e Radiologia e Diagnóstico por Imagem",
    "source_item": "16.13 - item 2A; detalhamento 17.5.1-17.5.2",
    "status": "REVIEW_REQUIRED",
    "scoring": {
      "type": "PER_UNIT",
      "points_per_unit": 0.5,
      "unit": "projeto",
      "max_points": 1,
      "max_units": null,
      "description": "0,5 ponto por projeto elegível, teto de 1 ponto no item 2A. A ressalva é do enquadramento documental no detalhamento."
    },
    "shared_caps": [
      {
        "code": "CURR-HSRC-2027-DIRECT-BLOCO-2",
        "label": "Bloco 2 - experiência acadêmica/profissional",
        "max_points": 5
      }
    ],
    "requirements": [
      "Pelo menos 120 horas no projeto.",
      "Declaração ou certificado institucional identifica candidato, atividade, carga, período, assinatura responsável e papel no projeto.",
      "Projeto registrado na instituição/departamento; comprovação oficial, não declaração pessoal de professor ou orientador.",
      "O detalhamento 17.5.1 agrupa 2A e 2B como estágios/atividades de extensão durante a graduação e exclui atividade curricular obrigatória."
    ],
    "caveats": [
      "O título do detalhamento agrupa extensão com estágio em instituição com residência médica; conferir o alcance desse requisito para o projeto. Não eliminar essa condição por inferência.",
      "A exigência de certificado de residência/pós-graduação na mesma seção parece estar deslocada, mas não foi silenciosamente corrigida."
    ],
    "evidence": [
      {
        "url": "https://anexos-r2.selecao.net.br/uploads/729/concursos/67/anexos/ad859832-d6fe-4802-8714-a927508f1d26.pdf",
        "title": "AFECC/HSRC - Edital 1 de 25/08/2026, ingresso 2027",
        "pages": "1, 14, 17",
        "sha256": "c5e3b3ff6cbe49b0da6f86593cf65843dd3d8a08ff780762664da9b39d540c32"
      }
    ],
    "checked_at": "2026-08-30",
    "record_hash": "91ad764bbd2d1a9fb33160da30723a156f7e255bebc8d471beff55a03f72fddc"
  },
  {
    "source_rule_id": "CURR-HSRC-2027-DIRECT-IC",
    "source_process_id": "2027-ES-HSRC-IBEST",
    "activity_codes": [
      "RESEARCH"
    ],
    "title": "Iniciação científica com bolsa ou voluntária por pelo menos um ano",
    "access_type": "DIRECT",
    "specialties_text": "Anestesiologia, Cirurgia Geral, Clínica Médica e Radiologia e Diagnóstico por Imagem",
    "source_item": "16.13 - item 3B; detalhamento 17.6.2",
    "status": "POINTS_CONFIRMED",
    "scoring": {
      "type": "PER_UNIT",
      "points_per_unit": 0.25,
      "unit": "projeto elegível",
      "max_points": 0.25,
      "max_units": null,
      "description": "0,25 ponto, com teto de 0,25 ponto no item 3B."
    },
    "shared_caps": [
      {
        "code": "CURR-HSRC-2027-DIRECT-BLOCO-3",
        "label": "Bloco 3 - experiências de pesquisa",
        "max_points": 2.5,
        "notes": "Compartilhado com capítulos, artigos, resumos e apresentações da mesma seção."
      }
    ],
    "requirements": [
      "Projeto de pesquisa de caráter institucional, CNPq ou fundação estadual de fomento, com bolsa ou participação voluntária por pelo menos um ano.",
      "Pesquisa/produção científica na área médica.",
      "Atuação como aluno pesquisador ou função diretamente ligada à realização da pesquisa.",
      "Declaração/certificado oficial com candidato, função, nome/descrição do projeto, período e assinatura da autoridade ou representante institucional."
    ],
    "caveats": [
      "Não aceita período inferior a um ano nem comprovação como auxiliar, contratado ou em função administrativa como equivalentes à pesquisa.",
      "Declaração pessoal de professor/orientador/pesquisador não substitui comprovação institucional."
    ],
    "evidence": [
      {
        "url": "https://anexos-r2.selecao.net.br/uploads/729/concursos/67/anexos/ad859832-d6fe-4802-8714-a927508f1d26.pdf",
        "title": "AFECC/HSRC - Edital 1 de 25/08/2026, ingresso 2027",
        "pages": "1, 15, 18",
        "sha256": "c5e3b3ff6cbe49b0da6f86593cf65843dd3d8a08ff780762664da9b39d540c32"
      }
    ],
    "checked_at": "2026-08-30",
    "record_hash": "3a07bb104ebd36ec4d7a09d95ea5b4091f43341ab8263feb7d873e5410003315"
  },
  {
    "source_rule_id": "CURR-HSRC-2027-DIRECT-MONITORIA",
    "source_process_id": "2027-ES-HSRC-IBEST",
    "activity_codes": [
      "TEACHING_ASSISTANT"
    ],
    "title": "Monitoria / iniciação à docência - conferir duração",
    "access_type": "DIRECT",
    "specialties_text": "Anestesiologia, Cirurgia Geral, Clínica Médica e Radiologia e Diagnóstico por Imagem",
    "source_item": "16.13 - item 2C; detalhamento 17.5.3",
    "status": "REVIEW_REQUIRED",
    "scoring": {
      "type": "PER_UNIT",
      "points_per_unit": 0.25,
      "unit": "monitoria elegível",
      "max_points": 0.5,
      "max_units": null,
      "description": "0,25 ponto pela monitoria comprovada; teto de 0,5 ponto. Conferir o requisito adicional de semestre no detalhamento."
    },
    "shared_caps": [
      {
        "code": "CURR-HSRC-2027-DIRECT-BLOCO-2",
        "label": "Bloco 2 - experiência acadêmica/profissional",
        "max_points": 5
      }
    ],
    "requirements": [
      "O quadro exige 80 horas totais ou no mínimo quatro meses.",
      "O detalhamento também menciona um semestre letivo de monitoria/PID.",
      "Certificado ou declaração da instituição de ensino em papel timbrado, com candidato, disciplina, assinatura e identificação da autoridade, período e carga semanal e/ou total."
    ],
    "caveats": [
      "Não tratar apenas 80 horas como atendimento automático: o qualificador de semestre do item 17.5.3 foi preservado para conferência.",
      "Semestre letivo e meses corridos não foram equiparados."
    ],
    "evidence": [
      {
        "url": "https://anexos-r2.selecao.net.br/uploads/729/concursos/67/anexos/ad859832-d6fe-4802-8714-a927508f1d26.pdf",
        "title": "AFECC/HSRC - Edital 1 de 25/08/2026, ingresso 2027",
        "pages": "1, 14, 17-18",
        "sha256": "c5e3b3ff6cbe49b0da6f86593cf65843dd3d8a08ff780762664da9b39d540c32"
      }
    ],
    "checked_at": "2026-08-30",
    "record_hash": "ba212cf39db39098b7bbf903f3048b33100725fffb4e3dc4ccc88cd1f1f67fa5"
  },
  {
    "source_rule_id": "CURR-PSU-MG-2027-DIRECT-3B-TEACHING-ASSISTANT",
    "source_process_id": "2027-MG-PSU-MG-AREMG",
    "activity_codes": [
      "TEACHING_ASSISTANT"
    ],
    "title": "Monitoria ou Programa de Iniciação à Docência na instituição de origem",
    "access_type": "DIRECT",
    "specialties_text": null,
    "source_item": "Anexo 1, item 3b",
    "status": "POINTS_CONFIRMED",
    "scoring": {
      "type": "FIXED",
      "points_per_unit": 1,
      "unit": "monitoria/PID",
      "max_points": 1,
      "max_units": 1,
      "description": "1 ponto por uma monitoria/PID elegível; não é 1 ponto a cada semestre ou disciplina."
    },
    "shared_caps": [
      {
        "code": "PSU-MG-2027-DIRECT-ITEM-3",
        "label": "Estágios extracurriculares/PET-Saúde e monitoria",
        "max_points": 2,
        "notes": "Monitoria tem limite individual de 1 ponto; os outros pontos da seção dependem de outra atividade elegível."
      }
    ],
    "requirements": [
      "Realização durante a graduação em Medicina, na instituição de origem, em disciplina constante no histórico escolar.",
      "Uma monitoria/PID por um semestre letivo de pelo menos 16 semanas; mínimo de 80 horas totais, com referência de 5 horas semanais na fonte.",
      "Documento da instituição de ensino em papel timbrado, com candidato, disciplina, assinatura/identificação da autoridade ou representante, datas de início/término e carga semanal ou total.",
      "Os períodos das atividades do item 3 não podem se sobrepor além da tolerância máxima de 30 dias. Consideram-se integralmente todos os períodos e certificados apresentados, sem fracionamento para evitar concomitância."
    ],
    "caveats": [
      "A tabela identifica o item como 3b; o parágrafo documental contém referência divergente a 3c, a conferir no envio.",
      "Observar autenticação e respectivas exceções, identificação do item, rubrica e destaques das orientações gerais. Documentos provisórios datados há mais de um ano não são aceitos."
    ],
    "evidence": [
      {
        "url": "https://www.galaxcms.com.br/up_crud_comum/601/Anexo1-AvaliacaoCurricularPadronizadaEntradaDiretaPSUMG2027-20260716100113.pdf",
        "title": "PSU-MG 2027 - Anexo 1, avaliação curricular de entrada direta",
        "pages": "2-3,8-11",
        "sha256": "8218e70f5fa5ce59f599d54a6075908320c053331be32f37ab70ad8eaf3b64bf"
      }
    ],
    "checked_at": "2026-08-30",
    "record_hash": "5d54a066e23c616e39d2ab3086712b2bac0f7ed2afc6d3c3ae4c4fa9c99c8abc"
  },
  {
    "source_rule_id": "CURR-PSU-MG-2027-DIRECT-4A-RESEARCH-SCHOLARSHIP",
    "source_process_id": "2027-MG-PSU-MG-AREMG",
    "activity_codes": [
      "RESEARCH"
    ],
    "title": "Bolsa de iniciação científica (BIC)",
    "access_type": "DIRECT",
    "specialties_text": null,
    "source_item": "Anexo 1, item 4a",
    "status": "REVIEW_REQUIRED",
    "scoring": {
      "type": "FIXED",
      "points_per_unit": 0.5,
      "unit": "bolsa de IC",
      "max_points": 0.5,
      "max_units": 1,
      "description": "A tabela atribui 0,5 ponto a uma BIC. A acumulação com 4b permanece sem interpretação automática."
    },
    "shared_caps": [
      {
        "code": "PSU-MG-2027-DIRECT-ITEM-4",
        "label": "Iniciação científica e projeto de pesquisa",
        "max_points": 1.3,
        "notes": "Teto literal de 1,30; o OU entre 4a e 4b impede inferir silenciosamente que todos os subitens se acumulam."
      }
    ],
    "requirements": [
      "Atividade exclusivamente durante a graduação em Medicina e na instituição de origem.",
      "Uma BIC institucional, do CNPq, CAPES ou fundação estadual de apoio à pesquisa, por pelo menos 6 meses consecutivos e 80 horas.",
      "Certificado ou declaração oficial da instituição de ensino do candidato ou de fomento, em papel timbrado, identificando candidato, função, atividade/projeto, período e autoridade responsável ou representante oficial.",
      "O documento deve indicar expressamente que o candidato foi bolsista; simples participação não comprova 4a. Declaração pessoal de professor, orientador ou pesquisador não é aceita.",
      "Tolerância máxima de sobreposição de 30 dias entre as atividades do item 4."
    ],
    "caveats": [
      "A descrição de 4a termina com OU antes de 4b; simultaneamente, o teto de 1,30 corresponde à soma numérica de 4a, 4b e 4c. Preservada a inconsistência: não calcular acumulação automaticamente.",
      "As exigências gerais de autenticação e respectivas exceções, marcação, rubrica e validade de documentos provisórios continuam aplicáveis."
    ],
    "evidence": [
      {
        "url": "https://www.galaxcms.com.br/up_crud_comum/601/Anexo1-AvaliacaoCurricularPadronizadaEntradaDiretaPSUMG2027-20260716100113.pdf",
        "title": "PSU-MG 2027 - Anexo 1, avaliação curricular de entrada direta",
        "pages": "2-3,11-13",
        "sha256": "8218e70f5fa5ce59f599d54a6075908320c053331be32f37ab70ad8eaf3b64bf"
      }
    ],
    "checked_at": "2026-08-30",
    "record_hash": "4eaccabe477fc9826e358a628c9c328df0f32efd9b1031ae9f2cb9e3b0c123ea"
  },
  {
    "source_rule_id": "CURR-PSU-MG-2027-DIRECT-4B-VOLUNTARY-RESEARCH",
    "source_process_id": "2027-MG-PSU-MG-AREMG",
    "activity_codes": [
      "RESEARCH"
    ],
    "title": "Participação voluntária em iniciação científica, com ou sem bolsa",
    "access_type": "DIRECT",
    "specialties_text": null,
    "source_item": "Anexo 1, item 4b",
    "status": "REVIEW_REQUIRED",
    "scoring": {
      "type": "FIXED",
      "points_per_unit": 0.3,
      "unit": "participação em IC",
      "max_points": 0.3,
      "max_units": 1,
      "description": "A tabela atribui 0,3 ponto a uma participação. A expressão temporal e a acumulação com 4a exigem conferência."
    },
    "shared_caps": [
      {
        "code": "PSU-MG-2027-DIRECT-ITEM-4",
        "label": "Iniciação científica e projeto de pesquisa",
        "max_points": 1.3,
        "notes": "Teto literal de 1,30; o OU entre 4a e 4b impede inferir silenciosamente que todos os subitens se acumulam."
      }
    ],
    "requirements": [
      "Atividade exclusivamente durante a graduação em Medicina e na instituição de origem.",
      "Uma participação voluntária em IC institucional, CNPq, CAPES ou fundação estadual de apoio à pesquisa, com ou sem bolsa, e carga mínima de 80 horas.",
      "O texto exige duração mínima de mais 6 meses consecutivos. A expressão mais 6 foi preservada, sem transformá-la em seis meses isolados ou em regra de soma.",
      "Certificado ou declaração oficial da instituição de ensino do candidato ou de fomento, em papel timbrado, identificando candidato, função, atividade/projeto, datas e assinatura/identificação da autoridade ou representante.",
      "Para 4b, aceitam-se documentos de participação com ou sem bolsa; não se aceitam declarações pessoais de professores, orientadores ou pesquisadores.",
      "Tolerância máxima de sobreposição de 30 dias entre as atividades do item 4."
    ],
    "caveats": [
      "O OU ao final de 4a e a expressão mais 6 meses em 4b não permitem resolver automaticamente exclusividade, acumulação ou requisito de período adicional, apesar do teto literal de 1,30.",
      "As exigências gerais de autenticação e respectivas exceções, marcação, rubrica e validade de documentos provisórios continuam aplicáveis."
    ],
    "evidence": [
      {
        "url": "https://www.galaxcms.com.br/up_crud_comum/601/Anexo1-AvaliacaoCurricularPadronizadaEntradaDiretaPSUMG2027-20260716100113.pdf",
        "title": "PSU-MG 2027 - Anexo 1, avaliação curricular de entrada direta",
        "pages": "2-3,11-13",
        "sha256": "8218e70f5fa5ce59f599d54a6075908320c053331be32f37ab70ad8eaf3b64bf"
      }
    ],
    "checked_at": "2026-08-30",
    "record_hash": "712a0405e511173934319089f979a91f8bd1d4027987b87ebfa059f1c7ff9b74"
  },
  {
    "source_rule_id": "CURR-PSU-MG-2027-DIRECT-4C-RESEARCH-PROJECT",
    "source_process_id": "2027-MG-PSU-MG-AREMG",
    "activity_codes": [
      "RESEARCH"
    ],
    "title": "Projeto de pesquisa em grupo registrado no CNPq, com resultado divulgado",
    "access_type": "DIRECT",
    "specialties_text": null,
    "source_item": "Anexo 1, item 4c",
    "status": "REVIEW_REQUIRED",
    "scoring": {
      "type": "FIXED",
      "points_per_unit": 0.5,
      "unit": "projeto de pesquisa",
      "max_points": 0.5,
      "max_units": 1,
      "description": "0,5 ponto por um projeto elegível. O teto agregado de IC/pesquisa não é calculado devido à ambiguidade entre 4a e 4b."
    },
    "shared_caps": [
      {
        "code": "PSU-MG-2027-DIRECT-ITEM-4",
        "label": "Iniciação científica e projeto de pesquisa",
        "max_points": 1.3,
        "notes": "Teto literal de 1,30; acumulação entre 4a e 4b exige conferência. O projeto de 4c deve ser diferente dos de 4a/4b."
      }
    ],
    "requirements": [
      "Projeto realizado durante a graduação em Medicina e na instituição de origem, distinto das atividades apresentadas em 4a e 4b.",
      "Participação mínima de 12 meses consecutivos e 80 horas em grupo de pesquisa registrado no CNPq e com atividades regulares.",
      "Resultado da pesquisa publicado em revista indexada ou apresentado oralmente ou como pôster em evento científico.",
      "Certificado ou declaração oficial da instituição de ensino do candidato ou de fomento, em papel timbrado, com candidato, função, projeto/atividade, datas e assinatura/identificação da autoridade ou representante oficial; declaração pessoal não basta.",
      "Anexar publicação ou certificado de apresentação, identificando candidato e resumo do trabalho resultante; apresentar também comprovação do Diretório de Grupos de Pesquisa do CNPq com candidato e grupo destacados.",
      "Tolerância máxima de sobreposição de 30 dias entre atividades do item 4."
    ],
    "caveats": [
      "A pontuação individual de 4c está explícita; a revisão necessária diz respeito à acumulação do bloco, cujo teto literal foi preservado.",
      "Não confundir participação em pesquisa com mera autoria de artigo. As exigências gerais de autenticação e validade documental também se aplicam."
    ],
    "evidence": [
      {
        "url": "https://www.galaxcms.com.br/up_crud_comum/601/Anexo1-AvaliacaoCurricularPadronizadaEntradaDiretaPSUMG2027-20260716100113.pdf",
        "title": "PSU-MG 2027 - Anexo 1, avaliação curricular de entrada direta",
        "pages": "2-3,11-13",
        "sha256": "8218e70f5fa5ce59f599d54a6075908320c053331be32f37ab70ad8eaf3b64bf"
      }
    ],
    "checked_at": "2026-08-30",
    "record_hash": "8251efc1b9f1d3e9ccca2c01a1852e4ac05c37a88b3d434cfc692d68ca928fff"
  },
  {
    "source_rule_id": "CURR-PSU-MG-2027-DIRECT-5A-EVENT-ORGANIZER",
    "source_process_id": "2027-MG-PSU-MG-AREMG",
    "activity_codes": [
      "EVENT_ORGANIZER"
    ],
    "title": "Organizador de evento de sociedade de especialidade médica ou entidade de classe",
    "access_type": "DIRECT",
    "specialties_text": null,
    "source_item": "Anexo 1, item 5a",
    "status": "REVIEW_REQUIRED",
    "scoring": {
      "type": "FIXED",
      "points_per_unit": 0.25,
      "unit": "participação como organizador",
      "max_points": 0.25,
      "max_units": 1,
      "description": "0,25 ponto por uma participação; escopo e duração devem ser conferidos pela divergência entre título e detalhamento."
    },
    "shared_caps": [
      {
        "code": "PSU-MG-2027-DIRECT-ITEM-5",
        "label": "Organização e palestra em eventos",
        "max_points": 0.5,
        "notes": "Para pontuar organização e palestra, as participações devem ocorrer em eventos diferentes."
      }
    ],
    "requirements": [
      "Atuação durante a graduação em Medicina como organizador de evento promovido por sociedade de especialidade médica ou entidade médica de classe, sem relação com ligas acadêmicas.",
      "O detalhamento de 5a exige evento de pelo menos 8 horas; o título da seção descreve congressos estaduais/nacionais de 8 horas ou dois dias consecutivos.",
      "Certificado ou declaração oficial dos responsáveis pela atividade, em papel timbrado ou com carimbo identificador, com candidato, evento/entidades, tipo de participação, datas, carga horária e assinatura/identificação das autoridades.",
      "Para acumular com 5b, deve ser evento diferente daquele utilizado para comprovar a palestra."
    ],
    "caveats": [
      "Preservada a divergência: título restringe a congressos estaduais/nacionais e admite dois dias; detalhamento cita eventos científicos, mesas-redondas/reuniões e exige 8 horas. Não ampliar escopo nem escolher um ramo silenciosamente.",
      "Secretário, colaborador ou coordenador de mesa não equivalem ao papel exigido. Aplicam-se também as regras gerais de autenticação e validade documental."
    ],
    "evidence": [
      {
        "url": "https://www.galaxcms.com.br/up_crud_comum/601/Anexo1-AvaliacaoCurricularPadronizadaEntradaDiretaPSUMG2027-20260716100113.pdf",
        "title": "PSU-MG 2027 - Anexo 1, avaliação curricular de entrada direta",
        "pages": "2-3,13-14",
        "sha256": "8218e70f5fa5ce59f599d54a6075908320c053331be32f37ab70ad8eaf3b64bf"
      }
    ],
    "checked_at": "2026-08-30",
    "record_hash": "9959e5cab1cb6d792dea25cf9aa5302aaa9b09898648b27e00f056733e03f8bc"
  },
  {
    "source_rule_id": "CURR-PSU-MG-2027-DIRECT-5B-EVENT-SPEAKER",
    "source_process_id": "2027-MG-PSU-MG-AREMG",
    "activity_codes": [
      "EVENT_SPEAKER"
    ],
    "title": "Palestrante em evento de sociedade de especialidade médica ou entidade de classe",
    "access_type": "DIRECT",
    "specialties_text": null,
    "source_item": "Anexo 1, item 5b",
    "status": "REVIEW_REQUIRED",
    "scoring": {
      "type": "FIXED",
      "points_per_unit": 0.25,
      "unit": "participação como palestrante",
      "max_points": 0.25,
      "max_units": 1,
      "description": "0,25 ponto por uma participação; escopo e duração devem ser conferidos pela divergência entre título e detalhamento."
    },
    "shared_caps": [
      {
        "code": "PSU-MG-2027-DIRECT-ITEM-5",
        "label": "Organização e palestra em eventos",
        "max_points": 0.5,
        "notes": "Para pontuar organização e palestra, as participações devem ocorrer em eventos diferentes."
      }
    ],
    "requirements": [
      "Atuação como palestrante durante a graduação em Medicina, em evento promovido por sociedade de especialidade médica ou entidade médica de classe, sem relação com ligas acadêmicas.",
      "O detalhamento exige evento de pelo menos 8 horas, não palestra de 8 horas; o título menciona congressos estaduais/nacionais de 8 horas ou dois dias consecutivos.",
      "Certificado ou declaração oficial dos responsáveis pela atividade, em papel timbrado ou com carimbo identificador, com candidato, evento/entidades, tipo de participação, datas, carga horária e assinatura/identificação das autoridades.",
      "Para acumular com 5a, o evento deve ser diferente daquele utilizado para comprovar a organização."
    ],
    "caveats": [
      "Preservada a divergência entre o escopo e a duração definidos no título e nos subitens. Não escolher automaticamente o critério mais amplo.",
      "Apresentação de trabalho, tema livre, pôster, palestra orientada, debatedor, mediador, secretário, colaborador ou coordenador de mesa não equivalem a palestrante para este item.",
      "As regras gerais de autenticação e validade documental também se aplicam."
    ],
    "evidence": [
      {
        "url": "https://www.galaxcms.com.br/up_crud_comum/601/Anexo1-AvaliacaoCurricularPadronizadaEntradaDiretaPSUMG2027-20260716100113.pdf",
        "title": "PSU-MG 2027 - Anexo 1, avaliação curricular de entrada direta",
        "pages": "2-3,13-14",
        "sha256": "8218e70f5fa5ce59f599d54a6075908320c053331be32f37ab70ad8eaf3b64bf"
      }
    ],
    "checked_at": "2026-08-30",
    "record_hash": "0b528601f046951e4fad636a904d64e4a16f020f17828fc70f22ff358f37c17f"
  },
  {
    "source_rule_id": "CURR-PSU-MG-2027-DIRECT-9A-EXTENSION-PROJECT",
    "source_process_id": "2027-MG-PSU-MG-AREMG",
    "activity_codes": [
      "EXTENSION_PROJECT"
    ],
    "title": "Projeto ou programa de extensão médica na instituição de origem",
    "access_type": "DIRECT",
    "specialties_text": null,
    "source_item": "Anexo 1, item 9a",
    "status": "POINTS_CONFIRMED",
    "scoring": {
      "type": "FIXED",
      "points_per_unit": 0.7,
      "unit": "projeto de extensão",
      "max_points": 0.7,
      "max_units": 1,
      "description": "0,7 ponto por um projeto de extensão elegível, sem multiplicação por semestre ou carga horária."
    },
    "shared_caps": [
      {
        "code": "PSU-MG-2027-DIRECT-ITEM-9",
        "label": "Extensão e participação voluntária junto à comunidade",
        "max_points": 1,
        "notes": "Os 0,3 ponto restantes pertencem ao item 9b, com critérios próprios de voluntariado; não são pontos adicionais por extensão."
      }
    ],
    "requirements": [
      "Projeto ou programa de extensão na área médica, na IES de origem durante a graduação em Medicina, sem vínculo com ligas acadêmicas e distinto das atividades do item 9b.",
      "Um projeto por pelo menos um semestre letivo, com mínimo de 16 semanas e 80 horas totais.",
      "Cadastro comprovado na pró-reitoria ou coordenação de extensão da IES, com descrição das atividades efetivamente realizadas.",
      "Certificado em papel timbrado da IES de origem, com candidato, nome do projeto, descrição das atividades, registro institucional, datas de início/término, carga horária e assinatura/identificação da autoridade ou representante oficial.",
      "Título do projeto sem descrição das atividades não basta; declarações pessoais de professores ou orientadores não são aceitas.",
      "Tolerância máxima de 30 dias de sobreposição entre atividades do item 9."
    ],
    "caveats": [
      "Excluem-se cursos ou eventos de extensão, estágios extracurriculares práticos, realização de cursos, atividades esportivas/culturais e reuniões clínicas, inclusive discussão de casos, protocolos e artigos.",
      "Não confundir extensão com voluntariado do item 9b. Observar as exigências gerais de autenticação, marcação, rubrica e validade documental."
    ],
    "evidence": [
      {
        "url": "https://www.galaxcms.com.br/up_crud_comum/601/Anexo1-AvaliacaoCurricularPadronizadaEntradaDiretaPSUMG2027-20260716100113.pdf",
        "title": "PSU-MG 2027 - Anexo 1, avaliação curricular de entrada direta",
        "pages": "2-3,18-19",
        "sha256": "8218e70f5fa5ce59f599d54a6075908320c053331be32f37ab70ad8eaf3b64bf"
      }
    ],
    "checked_at": "2026-08-30",
    "record_hash": "a7bbcc92e98e8bbd3a53a0e233e5129698dee62d4aafda76730007bf6263f08a"
  },
  {
    "source_rule_id": "CURR-UFCSPA-2027-MONITORIA-IC-EXTENSAO",
    "source_process_id": "2027-RS-UFCSPA-FUNDMED",
    "activity_codes": [
      "TEACHING_ASSISTANT",
      "RESEARCH",
      "EXTENSION_PROJECT"
    ],
    "title": "Monitoria, iniciação científica e extensão selecionadas por edital",
    "access_type": "BOTH",
    "specialties_text": null,
    "source_item": "Anexo III - item e",
    "status": "POINTS_CONFIRMED",
    "scoring": {
      "type": "PER_UNIT",
      "points_per_unit": 0.5,
      "unit": "semestre do calendário acadêmico da atividade",
      "max_points": 2,
      "max_units": null,
      "description": "0,5 ponto por semestre acadêmico da atividade; teto conjunto de 2 pontos para o item e."
    },
    "shared_caps": [
      {
        "code": "CURR-UFCSPA-2027-ITEM-E",
        "label": "Monitorias e atividades equivalentes - item e",
        "max_points": 2,
        "notes": "Único teto para monitoria, pesquisa, IC, extensão, iniciação tecnológica/docência e subinvestigação clínica previstas na fonte."
      }
    ],
    "requirements": [
      "Atividade obtida por seleção mediante edital, independentemente de remuneração.",
      "Cadastro formal nos órgãos indicados pela fonte: instituição de ensino superior, CAPES, CNPq ou Comitê de Ética e Pesquisa, conforme a modalidade.",
      "Declaração, atestado ou certificado da instituição na qual a atividade foi desenvolvida, com identificação do candidato.",
      "Observar o enquadramento formativo das atividades descrito nas observações gerais do Anexo III."
    ],
    "caveats": [
      "Os três filtros apontam para a mesma regra e o mesmo teto; não são três benefícios independentes de 2 pontos.",
      "A unidade é semestre acadêmico, não projeto nem certificado.",
      "A fonte não esclarece o acúmulo de atividades simultâneas no mesmo semestre; não somar automaticamente.",
      "A atualização de 27/08/2026 altera o item g.7, sem modificar a fórmula do item e."
    ],
    "evidence": [
      {
        "url": "https://fundmed.org.br/website/wp-content/uploads/2026/08/UFCSPA-MEDICA-Edital-de-Abertura-das-Inscricoes-1.pdf",
        "title": "UFCSPA/Santa Casa - Edital nº 01, residência médica 2027",
        "pages": "34-35",
        "sha256": "92884bdcb737e64ec8aa17ddc494160fdccccfd59fdc658a8859fca8b52e0507"
      },
      {
        "url": "https://fundmed.org.br/website/wp-content/uploads/2026/08/UFCSPA-Medica-Atualizacao-do-edital.pdf",
        "title": "UFCSPA/Santa Casa - Edital nº 01-A, atualização de 27/08/2026",
        "pages": "1",
        "sha256": "48b19703a32f4281c853aab632082cb38e695bb476906bba09c59e0a0f8cd208"
      }
    ],
    "checked_at": "2026-08-30",
    "record_hash": "5deb6e89b680a820687ebc9898bb0f84acc66554073fa77147c4972dca6ed221"
  },
  {
    "source_rule_id": "CURR-UNITAU-2027-DIRECT-EXTENSAO",
    "source_process_id": "2027-SP-UNITAU-PRPPG",
    "activity_codes": [
      "EXTENSION_PROJECT"
    ],
    "title": "Projeto de extensão - fórmula conflitante no edital",
    "access_type": "DIRECT",
    "specialties_text": null,
    "source_item": "9.2.11 - acesso direto, item 1(b)",
    "status": "REVIEW_REQUIRED",
    "scoring": {
      "type": "MANUAL",
      "points_per_unit": null,
      "unit": "atividade",
      "max_points": 5,
      "max_units": null,
      "description": "Coluna do teto: 5 pontos. O texto menciona 1 ponto por atividade e 5 para cinco ou mais, mas também repete 10/20 pontos de estágio. A divergência exige conferência; nenhuma das fórmulas foi escolhida automaticamente."
    },
    "shared_caps": [
      {
        "code": "CURR-UNITAU-2027-DIRECT-ITEM-1B",
        "label": "Item 1(b) - extensão e gestão de ligas",
        "max_points": 5,
        "notes": "Extensão e gestão de ligas ocupam a mesma linha, não tetos independentes."
      },
      {
        "code": "CURR-UNITAU-2027-DIRECT-ITEM-1",
        "label": "Item 1 - estágios e atividades extracurriculares",
        "max_points": 40
      }
    ],
    "requirements": [
      "Projeto de extensão regular na IES, com pelo menos um ano.",
      "Atividade realizada até o fim do quarto ano ou oitavo período de Medicina.",
      "Comprovação por documento oficial assinado pelo representante competente e validado pela IES de origem."
    ],
    "caveats": [
      "A duplicação da fórmula de estágio foi confirmada visualmente na fonte, não é uma correção presumida do texto extraído.",
      "Não somar o teto da extensão ao teto de gestão de ligas como se fossem subitens separados."
    ],
    "evidence": [
      {
        "url": "https://unitau.br/arquivos/concursos/edital-2026-2027-revisado_05_08.pdf",
        "title": "UNITAU - Residência Médica 2027, edital revisado",
        "pages": "12-13",
        "sha256": "77df9b6538427c3977f6a3abe9d8e16cefba7fffd0ec92489f08b132dea1307b"
      }
    ],
    "checked_at": "2026-08-30",
    "record_hash": "9eb1d72374fda1e8578da89292fc501ea35c23c8ef2ff947710c5681e6fc1327"
  },
  {
    "source_rule_id": "CURR-UNITAU-2027-DIRECT-IC",
    "source_process_id": "2027-SP-UNITAU-PRPPG",
    "activity_codes": [
      "RESEARCH"
    ],
    "title": "Iniciação científica concluída, com ou sem bolsa",
    "access_type": "DIRECT",
    "specialties_text": null,
    "source_item": "9.2.11 - acesso direto, item 3(f)",
    "status": "POINTS_CONFIRMED",
    "scoring": {
      "type": "MAX_ONLY",
      "points_per_unit": null,
      "unit": null,
      "max_points": 15,
      "max_units": null,
      "description": "A tabela informa máximo de 15 pontos. Não explicita valor por projeto ou quantidade necessária para alcançar esse teto."
    },
    "shared_caps": [
      {
        "code": "CURR-UNITAU-2027-DIRECT-ITEM-3",
        "label": "Item 3 - produção científica",
        "max_points": 40,
        "notes": "Compartilhado com outros itens da produção científica; não repetir o mesmo trabalho/publicação em itens diferentes."
      }
    ],
    "requirements": [
      "Projeto regular de iniciação científica finalizado, com ou sem bolsa, de pelo menos um ano ou dois semestres.",
      "Certificação e regulação pela IES e/ou pelas agências oficiais de fomento indicadas: CNPq e fundações estaduais.",
      "Documento oficial validado na IES de origem, com assinatura do representante competente conforme o edital.",
      "Atividade realizada até a data de colação de grau em Medicina."
    ],
    "caveats": [
      "O teto de 15 pontos não foi interpretado como 15 pontos por projeto.",
      "Proibida a repetição do mesmo trabalho/publicação entre itens do bloco 3."
    ],
    "evidence": [
      {
        "url": "https://unitau.br/arquivos/concursos/edital-2026-2027-revisado_05_08.pdf",
        "title": "UNITAU - Residência Médica 2027, edital revisado",
        "pages": "13-14",
        "sha256": "77df9b6538427c3977f6a3abe9d8e16cefba7fffd0ec92489f08b132dea1307b"
      }
    ],
    "checked_at": "2026-08-30",
    "record_hash": "838439b350f392bde55aecce835d7e055c2972cedf1bdc26a004aa9b237c0bca"
  },
  {
    "source_rule_id": "CURR-UNITAU-2027-DIRECT-MONITORIA",
    "source_process_id": "2027-SP-UNITAU-PRPPG",
    "activity_codes": [
      "TEACHING_ASSISTANT"
    ],
    "title": "Monitoria até o quarto ano de Medicina",
    "access_type": "DIRECT",
    "specialties_text": null,
    "source_item": "9.2.11 - acesso direto, item 2(e)",
    "status": "POINTS_CONFIRMED",
    "scoring": {
      "type": "PER_UNIT",
      "points_per_unit": 5,
      "unit": "monitoria",
      "max_points": 10,
      "max_units": null,
      "description": "Uma monitoria: 5 pontos; duas ou mais: 10 pontos. O texto limita a pontuação, não explicita limite de documentos."
    },
    "shared_caps": [
      {
        "code": "CURR-UNITAU-2027-DIRECT-ITEM-2",
        "label": "Item 2 - monitorias",
        "max_points": 10
      }
    ],
    "requirements": [
      "Duração de pelo menos um semestre letivo e carga mínima de 20 horas mensais.",
      "Realizada até o fim do quarto ano ou oitavo período de Medicina.",
      "Comprovação por documento oficial da instituição, assinado por representante legal conforme o edital e validado pela IES de origem."
    ],
    "caveats": [
      "Horas mensais não são horas totais; semestre letivo não foi convertido em seis meses corridos.",
      "Regra do acesso direto, sem extensão automática ao pré-requisito."
    ],
    "evidence": [
      {
        "url": "https://unitau.br/arquivos/concursos/edital-2026-2027-revisado_05_08.pdf",
        "title": "UNITAU - Residência Médica 2027, edital revisado",
        "pages": "12-14",
        "sha256": "77df9b6538427c3977f6a3abe9d8e16cefba7fffd0ec92489f08b132dea1307b"
      }
    ],
    "checked_at": "2026-08-30",
    "record_hash": "e163f652b91b01599259f84ce445be1cfcba0254234bb83c7efb2ec36aa858c8"
  }
]$curriculum_payload$::jsonb;
  release_code_value constant text := 'CURRICULUM-PLANNING-2026-08-30-v1';
  expected_hash constant text := '1cb180bee1b01772f61cf263140f245611dc684407842392c5e7293823cfc1f5';
  protected_before jsonb;
  protected_after jsonb;
begin
  if exists (select 1 from public.curriculum_releases where is_current and code <> release_code_value) then
    raise exception 'Another curriculum snapshot is active; review before replacing it';
  end if;
  if exists (select 1 from public.curriculum_releases where code = release_code_value
    and (source_sha256 <> expected_hash or rule_count <> 41 or edict_count <> 7)) then
    raise exception 'Curriculum release hash mismatch';
  end if;
  if exists (
    select 1 from jsonb_array_elements(payload) r
    left join public.edicts e on e.source_process_id = r->>'source_process_id'
    where e.id is null or e.entry_year is null or e.entry_year < 2025
  ) then
    raise exception 'Curriculum source process missing or outside the approved period';
  end if;

  protected_before := (select jsonb_object_agg(t.table_name, t.fingerprint) from (
    select 'edicts' as table_name, md5(coalesce(string_agg(to_jsonb(x)::text, '|' order by x.id), '')) as fingerprint from public.edicts x
    union all select 'journals', md5(coalesce(string_agg(to_jsonb(x)::text, '|' order by x.id), '')) from public.journals x
    union all select 'institutions', md5(coalesce(string_agg(to_jsonb(x)::text, '|' order by x.id), '')) from public.institutions x
    union all select 'indexers', md5(coalesce(string_agg(to_jsonb(x)::text, '|' order by x.id), '')) from public.indexers x
    union all select 'scientific_rules', md5(coalesce(string_agg(to_jsonb(x)::text, '|' order by x.id), '')) from public.scientific_rules x
    union all select 'edict_institutions', md5(coalesce(string_agg(to_jsonb(x)::text, '|' order by x.id), '')) from public.edict_institutions x
    union all select 'journal_indexers', md5(coalesce(string_agg(to_jsonb(x)::text, '|' order by x.journal_id, x.indexer_id), '')) from public.journal_indexers x
    union all select 'edict_indexers', md5(coalesce(string_agg(to_jsonb(x)::text, '|' order by x.edict_id, x.indexer_id), '')) from public.edict_indexers x
  ) t);
  insert into public.curriculum_releases(code,description,checked_at,source_sha256,rule_count,edict_count,is_current)
    values(release_code_value,'Primeira rodada curricular: sete processos, com pontuação, requisitos e limites; cobertura parcial e sem cálculo de nota pessoal.','2026-08-30',expected_hash,41,7,false)
    on conflict(code) do nothing;

  insert into public.curriculum_rules(release_code,edict_id,source_process_id,source_rule_id,
    activity_codes,title,access_type,specialties_text,source_item,status,scoring,shared_caps,
    requirements,caveats,evidence,checked_at,record_hash)
  select release_code_value,e.id,r.source_process_id,r.source_rule_id,r.activity_codes,r.title,
    r.access_type,r.specialties_text,r.source_item,r.status,r.scoring,r.shared_caps,r.requirements,
    r.caveats,r.evidence,r.checked_at,r.record_hash
  from jsonb_to_recordset(payload) as r(source_process_id text,source_rule_id text,activity_codes text[],
    title text,access_type text,specialties_text text,source_item text,status text,scoring jsonb,
    shared_caps jsonb,requirements jsonb,caveats jsonb,evidence jsonb,checked_at date,record_hash text)
  join public.edicts e on e.source_process_id = r.source_process_id
  on conflict(release_code,source_rule_id) do nothing;

  if (select count(*) from public.curriculum_rules where release_code = release_code_value) <> 41
    or (select count(distinct edict_id) from public.curriculum_rules where release_code = release_code_value) <> 7
    or exists (
      select 1 from jsonb_array_elements(payload) p
      left join public.curriculum_rules r on r.release_code = release_code_value and r.source_rule_id = p->>'source_rule_id'
      where r.id is null or r.record_hash <> p->>'record_hash'
        or (to_jsonb(r) - array['id','edict_id','release_code','created_at']::text[]) <> p
    ) then
    raise exception 'Curriculum import reconciliation failed';
  end if;
  protected_after := (select jsonb_object_agg(t.table_name, t.fingerprint) from (
    select 'edicts' as table_name, md5(coalesce(string_agg(to_jsonb(x)::text, '|' order by x.id), '')) as fingerprint from public.edicts x
    union all select 'journals', md5(coalesce(string_agg(to_jsonb(x)::text, '|' order by x.id), '')) from public.journals x
    union all select 'institutions', md5(coalesce(string_agg(to_jsonb(x)::text, '|' order by x.id), '')) from public.institutions x
    union all select 'indexers', md5(coalesce(string_agg(to_jsonb(x)::text, '|' order by x.id), '')) from public.indexers x
    union all select 'scientific_rules', md5(coalesce(string_agg(to_jsonb(x)::text, '|' order by x.id), '')) from public.scientific_rules x
    union all select 'edict_institutions', md5(coalesce(string_agg(to_jsonb(x)::text, '|' order by x.id), '')) from public.edict_institutions x
    union all select 'journal_indexers', md5(coalesce(string_agg(to_jsonb(x)::text, '|' order by x.journal_id, x.indexer_id), '')) from public.journal_indexers x
    union all select 'edict_indexers', md5(coalesce(string_agg(to_jsonb(x)::text, '|' order by x.edict_id, x.indexer_id), '')) from public.edict_indexers x
  ) t);
  if protected_before <> protected_after then
    raise exception 'Protected existing records changed during curriculum import';
  end if;
  update public.curriculum_releases set is_current = true where code = release_code_value;
end;
$curriculum_import$;
