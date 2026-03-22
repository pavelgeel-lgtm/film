import { useState, useRef, useEffect, useCallback } from "react";

const API = import.meta.env.VITE_API_URL || "/api";
let _refreshing = null;
async function apiFetch(path, opts = {}, _retry = true) {
  const token = localStorage.getItem("access_token");
  const res = await fetch(API + path, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...opts.headers },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (res.status === 401 && _retry) {
    const rt = localStorage.getItem("refresh_token");
    if (rt) {
      if (!_refreshing) {
        _refreshing = fetch(API + "/auth/refresh", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: rt }),
        }).then(r => r.ok ? r.json() : Promise.reject()).then(d => {
          localStorage.setItem("access_token", d.access);
          localStorage.setItem("refresh_token", d.refresh);
        }).catch(() => {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.dispatchEvent(new Event("auth:logout"));
        }).finally(() => { _refreshing = null; });
      }
      await _refreshing;
      return apiFetch(path, opts, false);
    }
    window.dispatchEvent(new Event("auth:logout"));
    throw { error: "Не авторизован" };
  }
  if (!res.ok) throw await res.json();
  return res.json();
}

const PX={home:"M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5zM9 21V12h6v9",bell:"M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",box:"M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16zM3.27 6.96L12 12.01 20.73 6.96M12 22.08V12",hanger:"M20.38 18.01L13 10.28V8.5A2.5 2.5 0 109.5 6M3.62 18.01A1 1 0 004.5 19.5h15a1 1 0 00.88-1.49L13 10.28",film:"M2 2h20v20H2zM7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 7h5M17 17h5",car:"M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h3l2-4h8l2 4h3a2 2 0 012 2v6a2 2 0 01-2 2h-2",pin:"M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0zM12 13a3 3 0 100-6 3 3 0 000 6",users:"M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",search:"M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0",plus:"M12 5v14M5 12h14",sliders:"M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6",dl:"M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",ul:"M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12",x:"M18 6L6 18M6 6l12 12",cr:"M9 18l6-6-6-6",cd:"M6 9l6 6 6-6",cam:"M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 17a4 4 0 100-8 4 4 0 000 8",edit:"M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",doc:"M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",star:"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",arch:"M21 8v13H3V8M1 3h22v5H1zM10 12h4",truck:"M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM18.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5",tag:"M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01",clk:"M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2",chk:"M20 6L9 17l-5-5",alert:"M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",img:"M3 3h18v18H3zM3 15l5-5 4 4 3-3 5 5M14.5 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3",send:"M22 2L11 13M22 2l-7 20-4-9-9-4 20-7",layers:"M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",face:"M20 7c0 5.523-8 13-8 13S4 12.523 4 7a8 8 0 1116 0z",phone:"M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z",mail:"M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",grid:"M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",save:"M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM17 21v-8H7v8M7 3v5h8",user:"M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8",trash:"M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"};
const I=({n,s=18,c="currentColor",w=1.7})=>(<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" style={{display:"inline-block",flexShrink:0,verticalAlign:"middle"}}><path d={PX[n]||PX.star}/></svg>);
const ClapIcon=({s=28})=>(<svg width={s} height={s} viewBox="0 0 32 32" fill="none" style={{display:"inline-block",flexShrink:0}}><circle cx="13" cy="16" r="10" stroke="white" strokeWidth="2" fill="none"/><path d="M8 11L18 21M8 21L18 11" stroke="white" strokeWidth="2.5" strokeLinecap="round"/><path d="M20 11L24 15" stroke="#00AEEF" strokeWidth="2.5" strokeLinecap="round"/></svg>);

const ITEMS=[
  {id:"PRO-00089",name:"Носилки складные",cat:"Медоборудование",status:"На складе",cond:"Хорошее",val:4500,tags:["медицина","металл"],photos:3,origin:"Склад",unique:"Правая ручка погнута снизу",wh:"Склад А",cell:"A-14"},
  {id:"PRO-00147",name:"Ваза напольная белая, керамика h=60см",cat:"Декор",status:"Выдан",issuedTo:"Иванов А.С.",role:"Реквизитор",phone:"+7 (916) 100-20-30",project:"НАШ СПЕЦНАЗ-4",block:"Блок №3",returnDate:"01.03.2025",cond:"Отлично",val:8200,tags:["декор","керамика"],photos:3,origin:"Закупка",unique:"Скол на дне слева",wh:"Склад А",cell:"B-07"},
  {id:"PRO-00203",name:"Фрагменты СВУ (бутафория)",cat:"Оружие/бутафория",status:"На складе",cond:"Отлично",val:2100,tags:["бутафория","военное"],photos:4,origin:"Бутафорский цех",unique:"7 элементов в коробке",wh:"Склад Б",cell:"C-03"},
  {id:"PRO-00211",name:"Флаг российский напольный",cat:"Декор",status:"Зарезервирован",project:"НАШ СПЕЦНАЗ-4",cond:"Отлично",val:3400,tags:["флаг"],photos:3,origin:"Закупка",unique:"Позолоченный наконечник",wh:"Склад А",cell:"D-01"},
  {id:"PRO-00334",name:"Книги советские, 7 шт.",cat:"Документы",status:"На складе",cond:"Хорошее",val:1800,tags:["советское","книги"],photos:3,origin:"Оценка",unique:"3 шт. с печатями б-ки",wh:"Склад Б",cell:"A-22"},
  {id:"PRO-00156",name:"Рация Motorola портативная",cat:"Техника",status:"На ремонте",cond:"Требует ремонта",val:5600,tags:["техника","связь"],photos:3,origin:"Закупка",unique:"Трещина на антенне",wh:"Склад А",cell:"E-05"},
  {id:"COS-00044",name:"Форма СОБР, комплект №1",cat:"Форма/мундир",status:"На складе",cond:"Отлично",val:18000,tags:["форма","СОБР"],size:"52/176",photos:4,origin:"Закупка",unique:"Шеврон на левом рукаве",wh:"Склад Костюмов",cell:"К-08"},
  {id:"COS-00045",name:"Форма СОБР, комплект №2",cat:"Форма/мундир",status:"Выдан",issuedTo:"Петрова К.М.",role:"Костюмер",phone:"+7 (926) 300-40-50",project:"НАШ СПЕЦНАЗ-4",block:"Блок №3",returnDate:"01.03.2025",cond:"Хорошее",val:17500,tags:["форма","СОБР"],size:"54/182",photos:3,origin:"Закупка",unique:"Петля для карабина на спине",wh:"Склад Костюмов",cell:"К-09"},
  {id:"COS-00112",name:"Форма ППС, комплект",cat:"Форма/мундир",status:"На складе",cond:"Хорошее",val:12000,tags:["форма","полиция"],size:"50/178",photos:3,origin:"Закупка",unique:"Нашивки оригинальные, фуражка",wh:"Склад Костюмов",cell:"К-14"},
  {id:"COS-00204",name:"Спецодежда фельдшера",cat:"Форма/мундир",status:"На складе",cond:"Отлично",val:4200,tags:["медицина"],size:"48/170",photos:3,origin:"Закупка",unique:"Логотип скорой на спине",wh:"Склад Костюмов",cell:"К-21"},
];
const VEHICLES=[
  {id:"VEH-0023",name:"ГАЗ-21 Волга",sub:"1967 г.в. · Белый",owner:"Смирнов В.П.",phone:"+7 (903) 111-22-33",price:"8 000 руб/день",gearbox:"Механика",driver:"Включён",limits:"Нельзя красить",photos:6,history:["НАШ СПЕЦНАЗ-4","СЫЩИК-3"],grad:"linear-gradient(135deg,#E6F7FD,#B3E8FA)",ico:"car"},
  {id:"VEH-0031",name:"Броневик инкассатора",sub:"2019 г.в. · Серый",owner:"Петров В.И.",phone:"+7 (912) 000-11-22",price:"15 000 руб/день",gearbox:"АКПП",driver:"Включён",limits:"Только асфальт",photos:5,history:["НАШ СПЕЦНАЗ-4"],grad:"linear-gradient(135deg,#e2e8f0,#cbd5e1)",ico:"truck"},
  {id:"MTC-0004",name:"Мотоцикл Урал М-72",sub:"1953 г.в. · Хаки",owner:"Захаров Д.С.",phone:"+7 (916) 333-44-55",price:"5 000 руб/день",gearbox:"Механика",driver:"Не включён",limits:"Без владельца не заправлять",photos:4,history:["БЛОКПОСТ-2"],grad:"linear-gradient(135deg,#d1fae5,#a7f3d0)",ico:"layers"},
];
const LOCATIONS=[
  {id:"LOC-0011",name:"Квартира сталинка 3к, 85 кв.м",sub:"ул. Тверская, 18, кв. 34",address:"ул. Тверская, 18, Москва",owner:"Орлова Т.М.",phone:"+7 (499) 555-66-77",price:"15 000 руб/день",access:"с 9:00",ceiling:"3.2 м",style:"Советский интерьер",limits:"Нельзя вешать на стены",photos:12,history:["НАШ СПЕЦНАЗ-4","ДЕТЕКТИВ-2"],grad:"linear-gradient(135deg,#d1fae5,#a7f3d0)",ico:"pin",inventory:"Диван 3-мест., 2 кресла, журн. стол, обеденный стол на 6 перс., 6 стульев, кровать двуспальная с постельным бельём, тумбочки (2 шт.), шкаф платяной, комод, телевизор советский, холодильник, сервиз на 6 перс., чайник, ковёр, торшер, настольные лампы (2 шт.), зеркало напольное, книжные полки"},
  {id:"OBJ-0008",name:"Промздание, 2000 кв.м",sub:"Шоссе Энтузиастов, 42",address:"Шоссе Энтузиастов, 42, Москва",owner:"ООО Реалти Проп",phone:"+7 (495) 777-88-99",price:"40 000 руб/день",access:"Круглосуточно",ceiling:"8 м",style:"Бетон, кирпич, заброшенный вид",limits:"Уборка после съёмок",photos:18,history:["НАШ СПЕЦНАЗ-4","ЛИКВИДАЦИЯ-2"],grad:"linear-gradient(135deg,#fef3c7,#fde68a)",ico:"layers",inventory:"Металлические стеллажи (14 шт.), паллеты (30 шт.), бочки (8 шт.), деревянные ящики (~50 шт.), трубы и арматура, промышленный верстак, цепные блоки (2 шт.), прожектора (4 шт.), форклифт нерабочий"},
  {id:"LOC-0019",name:"Офис в Москва-Сити, 120 кв.м",sub:"Пресненская наб., 8",address:"Пресненская наб., 8, Москва",owner:"БЦ Башня",phone:"+7 (495) 000-11-22",price:"25 000 руб/день",access:"08:00-22:00",ceiling:"2.8 м",style:"Современный офис, стекло и металл",limits:"Согласовать шум с соседями",photos:8,history:["ДЕТЕКТИВ-2"],grad:"linear-gradient(135deg,#ede9fe,#ddd6fe)",ico:"layers",inventory:"Переговорный стол на 10 перс., офисные кресла (12 шт.), рабочие столы (8 шт.), шкафы для документов (4 шт.), доска-флипчарт, проектор+экран, кулер, кофемашина, холодильник, велотренажер, диван офисный, кресла-пуфы (2 шт.)"},
];
const PARTNER_PROPS=[
  {id:"PP-0012",name:"Советская мебель 1960-е",sub:"Рекостудия · Мебель",supplier:"Рекостудия",phone:"+7 (495) 100-20-30",price:"12 000 руб/день",cat:"Мебель",era:"1960-е",cond:"Хорошее",items:"Диван, 2 кресла, журн. стол, торшер",photos:8,history:["ТИХАЯ ГАВАНЬ","ДЕТЕКТИВ-2"],grad:"linear-gradient(135deg,#fce7f3,#fbcfe8)",ico:"arch",limits:"Нельзя перекрашивать"},
  {id:"PP-0031",name:"Оружие бутафорское SWAT",sub:"Арсенал-Проп · Оружие",supplier:"Арсенал-Проп",phone:"+7 (495) 200-30-40",price:"8 000 руб/день",cat:"Оружие/бутафория",era:"Современное",cond:"Отлично",items:"8 автоматов, 4 пистолета, аксессуары",photos:6,history:["НАШ СПЕЦНАЗ-4","БЛОКПОСТ-2"],grad:"linear-gradient(135deg,#E6F7FD,#B3E8FA)",ico:"arch",limits:"Транспортировать в кейсе"},
  {id:"PP-0044",name:"Медоборудование реанимация",sub:"МедПроп · Медоборудование",supplier:"МедПроп",phone:"+7 (495) 300-40-50",price:"18 000 руб/день",cat:"Медоборудование",era:"Современное",cond:"Отлично",items:"Каталка, монитор, дефибриллятор",photos:10,history:["НАШ СПЕЦНАЗ-4"],grad:"linear-gradient(135deg,#d1fae5,#a7f3d0)",ico:"box",limits:"Требует специалиста"},
];
const KPP_INIT=[
  {id:"46-1",type:"НАТ",loc:"Промздание на окраине",date:"08.02.2025",time:"09:00",dur:"4 ч 30 мин",desc:"Перестрелка СОБР",
   items:[{name:"Носилки (1 шт.)",dept:"реквизит",status:"На складе",ref:"PRO-00089"},{name:"Оружие бутафория (8 ед.)",dept:"реквизит",status:"Частично",note:"5 склад, 3 Арсенал-Проп"},{name:"Форма СОБР (5 компл.)",dept:"реквизит",status:"Постоянный",note:"Постоянный реквизит"},{name:"Листы А4 желтоватые",dept:"реквизит",status:"Нет",note:"Купить в канцелярии"},{name:"Спецодежда фельдшеров (2)",dept:"костюм",status:"На складе",ref:"COS-00204"}],
   makeup:[{char:"Соколов (гл.)",actor:"Волков Д.",look:"Синяк под левым глазом, порез на лбу",cont:"Сквозная 46-1 до 47-2"},{char:"Боец №1",actor:"Смирнов А.",look:"Боевой грим, камуфляж лица",cont:"-"}]},
  {id:"46-4",type:"ИНТ",loc:"Квартира Гермеса",date:"08.02.2025",time:"15:00",dur:"2 ч 00 мин",desc:"Гермес дома, беспорядок",
   items:[{name:"Советские книги (5-7 шт.)",dept:"реквизит",status:"На складе",ref:"PRO-00334"},{name:"Газетные вырезки (набор)",dept:"реквизит",status:"Сделать",note:"Художник делает сам"},{name:"Костюм Гермеса пальто",dept:"костюм",status:"Постоянный",note:"Сквозная сцена"}],
   makeup:[{char:"Гермес",actor:"Орлов П.",look:"Усталый вид, 3-дневная щетина",cont:"Сквозная 44-3 до 47-1"}]},
  {id:"46-9",type:"ИНТ",loc:"Офис следственного комитета",date:"09.02.2025",time:"10:00",dur:"3 ч 00 мин",desc:"Допрос",
   items:[{name:"Табличка Следственный комитет",dept:"реквизит",status:"Изготовить",note:"Задача бутафорскому цеху"},{name:"Российский флаг напольный",dept:"реквизит",status:"На складе",ref:"PRO-00211"}],
   makeup:[{char:"Следователь Нечаев",actor:"Кузнецов М.",look:"Официальный, без особенностей",cont:"-"}]},
  {id:"47-1",type:"НАТ",loc:"Улица у банка",date:"09.02.2025",time:"14:00",dur:"1 ч 30 мин",desc:"Отъезд инкассаторов",
   items:[{name:"А/М инкассаторов",dept:"транспорт",status:"Поставщик",note:"VEH-0031, Петров В.И."}],
   makeup:[{char:"Инкассатор 1",actor:"Ли В.",look:"Стандартный",cont:"-"},{char:"Инкассатор 2",actor:"Фёдоров С.",look:"Стандартный",cont:"-"}]},
];
const NOTIFS=[
  {id:1,lv:"crit",ico:"alert",title:"Реквизит не вернули",body:"PRO-00147 срок истёк 3 дня назад",who:"Иванов А.С.",role:"Реквизитор",phone:"+7 (916) 100-20-30",project:"НАШ СПЕЦНАЗ-4",itemId:"PRO-00147",itemName:"Ваза напольная белая керамика h=60см",returnDate:"28.02.2025",time:"3 дня"},
  {id:2,lv:"warn",ico:"clk",title:"Возврат через 3 дня",body:"COS-00045 вернуть до 01.03.2025",who:"Петрова К.М.",role:"Костюмер",phone:"+7 (926) 300-40-50",project:"НАШ СПЕЦНАЗ-4",itemId:"COS-00045",itemName:"Форма СОБР комплект №2",returnDate:"01.03.2025",time:"3 дня"},
  {id:3,lv:"info",ico:"arch",title:"На ремонте",body:"PRO-00156 в мастерской 5 дней",who:"Цех ремонта",role:"Мастерская",phone:"+7 (495) 000-11-22",project:"-",itemId:"PRO-00156",itemName:"Рация Motorola портативная",returnDate:"-",time:"5 дней"},
];
const ROLES_INIT=[
  {ico:"star",name:"Продюсер",g:"#00AEEF",bg:"#E6F7FD"},
  {ico:"users",name:"Директор проекта",g:"#00AEEF",bg:"#E6F7FD"},
  {ico:"arch",name:"Руководитель склада",g:"#059669",bg:"#dcfce7"},
  {ico:"arch",name:"Сотрудник склада",g:"#059669",bg:"#dcfce7"},
  {ico:"film",name:"Режиссёр",g:"#7c3aed",bg:"#ede9fe"},
  {ico:"film",name:"1-й помощник режиссёра",g:"#7c3aed",bg:"#ede9fe"},
  {ico:"doc",name:"Скрипт-супервайзер",g:"#0369a1",bg:"#e0f2fe"},
  {ico:"star",name:"Художник-постановщик",g:"#b45309",bg:"#fef3c7"},
  {ico:"tag",name:"Ассистент по реквизиту",g:"#059669",bg:"#dcfce7"},
  {ico:"star",name:"Ассистент художника",g:"#b45309",bg:"#fef3c7"},
  {ico:"hanger",name:"Ассистент по костюмам",g:"#7c3aed",bg:"#ede9fe"},
  {ico:"face",name:"Гримёр / Ассистент по гриму",g:"#be185d",bg:"#fce7f3"},
  {ico:"box",name:"Реквизитор",g:"#00AEEF",bg:"#E6F7FD"},
  {ico:"star",name:"Декоратор",g:"#b45309",bg:"#fef3c7"},
  {ico:"hanger",name:"Костюмер",g:"#7c3aed",bg:"#ede9fe"},
  {ico:"truck",name:"Поставщик",g:"#374151",bg:"#f3f4f6"},
];

const STC={"На складе":{bg:"#dcfce7",tx:"#15803d",d:"#16a34a"},"Выдан":{bg:"#fef3c7",tx:"#92400e",d:"#d97706"},"Зарезервирован":{bg:"#E6F7FD",tx:"#0090C8",d:"#00AEEF"},"На ремонте":{bg:"#ede9fe",tx:"#6d28d9",d:"#7c3aed"},"Списан":{bg:"#f3f4f6",tx:"#6b7280",d:"#9ca3af"},"Постоянный":{bg:"#d1fae5",tx:"#065f46",d:"#059669"},"Частично":{bg:"#fef3c7",tx:"#92400e",d:"#d97706"},"Нет":{bg:"#fee2e2",tx:"#991b1b",d:"#dc2626"},"Изготовить":{bg:"#ede9fe",tx:"#6d28d9",d:"#7c3aed"},"Сделать":{bg:"#e0f2fe",tx:"#0c4a6e",d:"#0284c7"},"Поставщик":{bg:"#e0f2fe",tx:"#0c4a6e",d:"#0284c7"}};
const sc=s=>STC[s]||{bg:"#f3f4f6",tx:"#6b7280",d:"#9ca3af"};
const DTC={"реквизит":{bg:"#dcfce7",tx:"#15803d"},"костюм":{bg:"#ede9fe",tx:"#6d28d9"},"транспорт":{bg:"#e0f2fe",tx:"#0c4a6e"},"грим":{bg:"#fce7f3",tx:"#9d174d"}};
const dc=d=>DTC[d]||{bg:"#f3f4f6",tx:"#6b7280"};

const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body,#root{height:100%;overflow:hidden}
:root{--blue:#00AEEF;--blue-light:#E6F7FD;--blue-mid:#B3E8FA;--blue-dark:#0090C8;--ink:#0A1628;--ink2:#3D4F6B;--ink3:#8898AA;--surface:#F4F7FA;--card:#FFFFFF;--border:rgba(0,0,0,.07);--border2:rgba(0,0,0,.11);--red:#E53E3E;--red-light:#FFF0F0;--green:#10B981;--green-light:#ECFDF5;--amber:#F59E0B;--amber-light:#FFFBEB;--purple:#7C3AED;--purple-light:#F3EFFE;--sh:0 1px 2px rgba(0,0,0,.04),0 4px 20px rgba(0,0,0,.06);--sh2:0 2px 4px rgba(0,0,0,.04),0 12px 40px rgba(0,0,0,.1);--sh3:0 24px 64px rgba(0,0,0,.14);--r:10px;--r2:14px;--r3:18px}
body{font-family:'Manrope',system-ui,sans-serif;background:var(--surface);color:var(--ink);-webkit-font-smoothing:antialiased}
::-webkit-scrollbar{width:3px;height:3px}::-webkit-scrollbar-thumb{background:rgba(0,0,0,.1);border-radius:4px}
.app{display:flex;height:100vh;overflow:hidden}

.sb{width:220px;min-width:220px;display:flex;flex-direction:column;background:var(--card);border-right:1px solid var(--border);z-index:20;box-shadow:1px 0 0 var(--border)}
.sb-top{padding:18px 16px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px}
.sb-mark{width:34px;height:34px;border-radius:9px;background:var(--blue);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 4px 12px rgba(0,174,239,.35)}
.sb-name{font-size:13.5px;font-weight:800;letter-spacing:-.3px;color:var(--ink)}
.sb-sub{font-size:10px;color:var(--ink3);font-weight:500;margin-top:1px;letter-spacing:.1px}
.nav{flex:1;overflow-y:auto;padding:10px 8px}
.ns{font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:var(--ink3);padding:10px 8px 4px;margin-top:2px}
.ni{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:var(--r);cursor:pointer;font-size:12.5px;font-weight:600;color:var(--ink2);transition:all .15s;position:relative}
.ni:hover{background:var(--surface);color:var(--ink)}
.ni.on{background:var(--blue-light);color:var(--blue)}
.ni.on::before{content:'';position:absolute;left:0;top:20%;bottom:20%;width:3px;background:var(--blue);border-radius:0 3px 3px 0}
.nico{display:flex;align-items:center;opacity:.45}.ni.on .nico{opacity:1}
.bdg{margin-left:auto;background:var(--red);color:#fff;font-size:9.5px;font-weight:700;padding:1px 6px;border-radius:20px;min-width:17px;text-align:center;letter-spacing:.2px}
.ni.on .bdg{background:rgba(0,174,239,.2);color:var(--blue)}
.sb-bot{padding:12px 10px;border-top:1px solid var(--border);display:flex;align-items:center;gap:10px}
.ava{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--blue),#0055A5);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#fff;flex-shrink:0;box-shadow:0 2px 8px rgba(0,174,239,.3)}
.avn{font-size:12px;font-weight:700;color:var(--ink)}.avr{font-size:10.5px;color:var(--ink3);font-weight:500;margin-top:1px}

.main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}
.topbar{padding:12px 22px;background:rgba(255,255,255,.92);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px}
.tbt{font-size:16px;font-weight:800;letter-spacing:-.4px;color:var(--ink)}
.tbp{font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;background:var(--blue-light);color:var(--blue);letter-spacing:.1px}
.content{flex:1;overflow-y:auto;padding:20px 22px}

.btn{display:inline-flex;align-items:center;gap:5px;padding:7px 14px;border-radius:var(--r);font-family:'Manrope',sans-serif;font-size:12.5px;font-weight:700;cursor:pointer;border:none;transition:all .15s;letter-spacing:-.1px}
.btn:hover{transform:translateY(-1px)}
.btn:active{transform:translateY(0)}
.bp{background:var(--blue);color:#fff;box-shadow:0 2px 8px rgba(0,174,239,.3)}.bp:hover{background:var(--blue-dark);box-shadow:0 4px 16px rgba(0,174,239,.4)}
.bg{background:var(--surface);color:var(--ink2);border:1px solid var(--border2)}.bg:hover{background:#eef2f7;border-color:var(--border2)}
.br{background:var(--red-light);color:var(--red);border:1px solid rgba(229,62,62,.15)}
.sm{padding:5px 11px;font-size:11.5px;border-radius:8px}

.card{background:var(--card);border-radius:var(--r2);border:1px solid var(--border);box-shadow:var(--sh);overflow:hidden}
.ch{padding:13px 18px 11px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border)}
.ct{font-size:14px;font-weight:800;letter-spacing:-.3px;color:var(--ink)}.cs{font-size:12px;color:var(--ink3);font-weight:500}

.sg{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px}
.sc{background:var(--card);border-radius:var(--r2);border:1px solid var(--border);box-shadow:var(--sh);padding:16px 18px;transition:box-shadow .2s,transform .2s}
.sc:hover{box-shadow:var(--sh2);transform:translateY(-2px)}
.sib{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:10px}
.sn{font-size:26px;font-weight:800;letter-spacing:-1px;line-height:1;color:var(--ink)}.sl{font-size:11px;color:var(--ink3);font-weight:600;margin-top:4px;letter-spacing:.2px}

.tbl{width:100%;border-collapse:collapse}
.tbl th{font-size:10px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.8px;padding:10px 16px;border-bottom:1px solid var(--border);text-align:left;background:#FAFBFC;white-space:nowrap}
.tbl td{padding:11px 16px;border-bottom:1px solid var(--border);font-size:13px;vertical-align:middle;color:var(--ink)}
.tbl tbody tr{cursor:pointer;transition:background .1s}.tbl tbody tr:hover td{background:var(--blue-light)}.tbl tbody tr:last-child td{border-bottom:none}

.pill{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap;letter-spacing:.1px}
.dot{width:5px;height:5px;border-radius:50%;flex-shrink:0}
.idc{font-family:'JetBrains Mono',monospace;font-size:10.5px;background:var(--blue-light);color:var(--blue);padding:2px 7px;border-radius:5px;font-weight:500}
.dtag{font-size:10px;font-weight:700;text-transform:uppercase;padding:2px 8px;border-radius:5px;letter-spacing:.3px}
.tag{display:inline-block;padding:2px 8px;background:var(--surface);color:var(--ink2);border-radius:5px;font-size:11px;font-weight:600;margin:2px;border:1px solid var(--border)}
.cellc{display:inline-flex;align-items:center;gap:4px;padding:2px 9px;border-radius:5px;font-size:11px;font-weight:700;background:var(--blue-light);color:var(--blue);font-family:'JetBrains Mono',monospace}

.g2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px}
.nr{display:flex;align-items:flex-start;gap:12px;padding:13px 18px;border-bottom:1px solid var(--border);cursor:pointer;transition:background .1s}
.nr:hover{background:var(--surface)}.nr:last-child{border-bottom:none}
.ni2{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
.ntt{font-size:13px;font-weight:700;color:var(--ink)}.nb{font-size:11.5px;color:var(--ink3);margin-top:2px;line-height:1.4;font-weight:500}
.nm{font-size:11px;color:var(--ink3);margin-top:3px;display:flex;gap:5px;font-weight:500}.ntm{font-size:11px;color:var(--ink3);white-space:nowrap;margin-left:auto;font-weight:600}

.kbar{background:var(--card);border-radius:var(--r2);border:1px solid var(--border);box-shadow:var(--sh);padding:16px 20px;margin-bottom:14px;display:flex;align-items:center;gap:18px;flex-wrap:wrap}
.kdate{font-size:22px;font-weight:800;letter-spacing:-1px;color:var(--ink)}
.kdiv{width:1px;height:36px;background:var(--border2);flex-shrink:0}
.kcnt{text-align:center}.kcn{font-size:22px;font-weight:800;letter-spacing:-.5px;color:var(--ink)}.kcl{font-size:10.5px;color:var(--ink3);font-weight:600;margin-top:2px;letter-spacing:.2px}

.scene{background:var(--card);border-radius:var(--r2);border:1px solid var(--border);box-shadow:var(--sh);overflow:hidden;margin-bottom:10px}
.sh2{padding:12px 16px;display:flex;align-items:center;gap:10px;transition:background .1s}
.sh2:hover{background:var(--surface)}
.snum{font-size:14px;font-weight:800;color:var(--blue);width:48px;flex-shrink:0;letter-spacing:-.3px}
.stag2{font-size:10px;font-weight:700;letter-spacing:.3px;padding:2px 8px;border-radius:5px}
.sloc{font-size:13.5px;font-weight:700;flex:1;color:var(--ink)}
.stm{font-size:11.5px;color:var(--ink3);font-weight:500}
.sdur{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:700;padding:3px 10px;border-radius:6px;background:var(--surface);color:var(--ink2);white-space:nowrap;margin-right:4px;border:1px solid var(--border)}
.sbody{border-top:1px solid var(--border)}
.stabs{display:flex;border-bottom:1px solid var(--border);padding:0 16px}
.stab{padding:9px 13px 10px;font-size:12.5px;font-weight:700;color:var(--ink3);cursor:pointer;border-bottom:2px solid transparent;transition:all .15s;background:none;border-top:none;border-left:none;border-right:none;font-family:'Manrope',sans-serif}
.stab.on{color:var(--blue);border-bottom-color:var(--blue)}
.sp{padding:14px 16px}
.sptitle{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--ink3);margin-bottom:10px;display:flex;align-items:center;gap:5px}
.ir{display:flex;align-items:flex-start;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)}
.ir:last-child{border-bottom:none}
.in{font-size:12.5px;font-weight:700;cursor:pointer;color:var(--blue)}.in:hover{text-decoration:underline}
.inote{font-size:11px;color:var(--ink3);margin-top:1px;font-weight:500}
.mkrow{display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)}
.mkrow:last-child{border-bottom:none}
.mkchar{font-size:13px;font-weight:700;min-width:110px;flex-shrink:0;color:var(--ink)}
.mkactor{font-size:11px;color:var(--ink3);font-weight:500;margin-top:1px}
.mklook{font-size:12.5px;font-weight:500;flex:1;color:var(--ink2)}
.mkcont{font-size:10.5px;font-weight:700;padding:2px 9px;border-radius:5px;background:var(--purple-light);color:var(--purple);white-space:nowrap;flex-shrink:0}

.ag{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px}
.ac{background:var(--card);border-radius:var(--r2);border:1px solid var(--border);box-shadow:var(--sh);overflow:hidden;cursor:pointer;transition:box-shadow .2s,transform .2s}
.ac:hover{box-shadow:var(--sh2);transform:translateY(-3px)}
.athumb{height:100px;display:flex;align-items:center;justify-content:center;opacity:.55}
.abody{padding:14px 16px}
.aid{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--ink3);margin-bottom:4px;font-weight:500}
.aname{font-size:14px;font-weight:800;letter-spacing:-.3px;margin-bottom:2px;color:var(--ink)}
.asub{font-size:11.5px;color:var(--ink3);margin-bottom:10px;font-weight:500}
.arow{display:flex;justify-content:space-between;align-items:flex-start;padding:5px 0;border-bottom:1px solid var(--border)}
.arow:last-child{border-bottom:none}.arl{font-size:11.5px;color:var(--ink3);font-weight:500}.arv{font-size:11.5px;font-weight:700;text-align:right;max-width:150px;color:var(--ink)}
.ahistt{font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--ink3);margin-bottom:6px;margin-top:9px;padding-top:8px;border-top:1px solid var(--border)}
.hchips{display:flex;gap:4px;flex-wrap:wrap}
.afoot{padding:10px 14px;border-top:1px solid var(--border);display:flex;gap:6px}

.ov{position:fixed;inset:0;background:rgba(10,22,40,.4);backdrop-filter:blur(10px);z-index:100;display:flex;overflow-y:auto;padding:20px}
.modal{margin:auto;background:var(--card);border-radius:var(--r3);box-shadow:var(--sh3);width:100%;max-width:660px;border:1px solid var(--border)}
.modal-wide{max-width:780px}
.mtop{padding:20px 22px 16px;border-bottom:1px solid var(--border);display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.mtitle{font-size:18px;font-weight:800;letter-spacing:-.5px;color:var(--ink)}
.mid{font-family:'JetBrains Mono',monospace;font-size:11.5px;color:var(--ink3);margin-top:3px;font-weight:500}
.xbtn{width:30px;height:30px;border-radius:50%;background:var(--surface);border:1px solid var(--border);cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s}
.xbtn:hover{background:var(--border2);transform:scale(1.05)}
.mtabs{display:flex;padding:0 18px;border-bottom:1px solid var(--border)}
.mtab{padding:10px 14px 11px;font-size:13px;font-weight:700;color:var(--ink3);cursor:pointer;border-bottom:2px solid transparent;transition:all .15s}
.mtab.on{color:var(--blue);border-bottom-color:var(--blue)}
.mbody{padding:20px 22px}
.mgrid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px}
.mgrid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:14px}
.mfl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--ink3);margin-bottom:4px}
.mfv{font-size:13px;font-weight:600;color:var(--ink)}
.pgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px}
.pph{aspect-ratio:4/3;border-radius:8px;background:var(--surface);border:1px solid var(--border);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;color:var(--ink3)}
.hrow{display:flex;gap:10px;padding:9px 0;border-bottom:1px solid var(--border)}.hrow:last-child{border-bottom:none}
.hdot{width:6px;height:6px;border-radius:50%;margin-top:5px;flex-shrink:0}
.hdate{font-family:'JetBrains Mono',monospace;font-size:10.5px;color:var(--ink3);white-space:nowrap}.htxt{font-size:12.5px;font-weight:600;color:var(--ink)}
.ibox{border-radius:8px;padding:11px 14px;margin-bottom:12px;border-left:3px solid}
.mact{display:flex;gap:8px;margin-top:16px;padding-top:16px;border-top:1px solid var(--border)}

.sw{position:relative}.sico{position:absolute;left:11px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--ink3);display:flex}
.si{padding:8px 12px 8px 34px;border-radius:var(--r);border:1.5px solid var(--border2);background:var(--card);font-family:'Manrope',sans-serif;font-size:13px;font-weight:500;color:var(--ink);outline:none;width:240px;transition:border-color .15s}
.si:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(0,174,239,.12)}
.frow{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.fg{margin-bottom:12px}
.fl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--ink3);display:block;margin-bottom:5px}
.fi{width:100%;padding:8px 12px;border-radius:var(--r);border:1.5px solid var(--border2);background:var(--surface);font-family:'Manrope',sans-serif;font-size:13px;font-weight:500;color:var(--ink);outline:none;transition:border-color .15s}
.fi:focus{border-color:var(--blue);background:var(--card);box-shadow:0 0 0 3px rgba(0,174,239,.12)}
.upz{border:2px dashed rgba(0,174,239,.25);border-radius:10px;padding:24px;text-align:center;cursor:pointer;color:var(--ink3);font-size:13px;font-weight:500;transition:all .15s}
.upz:hover{border-color:var(--blue);background:var(--blue-light)}
.rg{display:grid;grid-template-columns:repeat(auto-fill,minmax(188px,1fr));gap:10px}
.rc{background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:12px 14px;display:flex;align-items:center;gap:10px;box-shadow:var(--sh);transition:box-shadow .15s,transform .15s}
.rc:hover{box-shadow:var(--sh2);transform:translateY(-1px)}
.rico{width:32px;height:32px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.rname{font-size:12.5px;font-weight:700;line-height:1.3;color:var(--ink)}
.rc-add{cursor:pointer;border:2px dashed var(--border2);background:transparent}
.rc-add:hover{border-color:var(--blue);background:var(--blue-light)}
.sep{width:1px;height:13px;background:var(--border2);flex-shrink:0}
.pg{height:4px;background:var(--surface);border-radius:4px;overflow:hidden;border:1px solid var(--border)}.pf{height:100%;border-radius:4px}
.cbtn{display:inline-flex;align-items:center;gap:6px;padding:9px 16px;border-radius:var(--r);font-size:13px;font-weight:700;cursor:pointer;border:none;transition:all .15s}
.cbtn:hover{transform:translateY(-1px)}
.erow{display:flex;gap:6px;margin-bottom:7px;align-items:center}

@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
@keyframes modalIn{from{opacity:0;transform:scale(.96) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes overlayIn{from{opacity:0}to{opacity:1}}
@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-4px)}40%{transform:translateX(4px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}
@keyframes checkPop{0%{transform:scale(0) rotate(-10deg);opacity:0}60%{transform:scale(1.2) rotate(3deg);opacity:1}100%{transform:scale(1) rotate(0deg);opacity:1}}
@keyframes notifSlide{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}
@keyframes badgePulse{0%,100%{box-shadow:0 0 0 0 rgba(229,62,62,.4)}70%{box-shadow:0 0 0 6px rgba(229,62,62,0)}}
.content>*{animation:fadeIn .2s ease both}
.modal{animation:modalIn .22s cubic-bezier(.34,1.4,.64,1) both}
.ov{animation:overlayIn .18s ease both}
.scene{animation:fadeIn .2s ease both}
.nr{animation:notifSlide .2s ease both}
.btn{position:relative;overflow:hidden}
.btn::after{content:'';position:absolute;inset:0;background:rgba(255,255,255,0);transition:background .15s}
.btn:active::after{background:rgba(255,255,255,.18)}
.btn:active{transform:scale(.97) !important}
.btn-danger:active{animation:shake .3s ease !important}
.bdg{animation:badgePulse 2s ease infinite}
.xbtn:active{transform:scale(.9) !important}
.cbtn:active{transform:scale(.97)}
.wh-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:14px}
.notif-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:14px}
.kbar-top{display:flex;align-items:center;gap:18px}
.kbar-counts{display:flex;gap:18px;align-items:center}
.kbar-actions{display:flex;gap:6px;margin-left:auto}
.kpp-btns{display:flex;gap:6px;margin-top:10px;padding-top:10px;border-top:1px solid rgba(0,0,0,.05)}

.hamburger{display:none;width:36px;height:36px;align-items:center;justify-content:center;border:none;background:var(--surface);border-radius:var(--r);cursor:pointer;flex-shrink:0;border:1px solid var(--border)}
.sb-overlay{display:none;position:fixed;inset:0;background:rgba(10,22,40,.45);z-index:199;backdrop-filter:blur(2px)}
.bnav{display:none}

@media(max-width:768px){
  html,body,#root{overflow-x:hidden;max-width:100vw}
  .hamburger{display:flex}
  .app{height:100vh;overflow:hidden}
  .sb{position:fixed;top:0;left:0;bottom:0;width:82%;max-width:290px;min-width:0 !important;z-index:200;transform:translateX(-100%);transition:transform .25s cubic-bezier(.4,0,.2,1);box-shadow:var(--sh3)}
  .sb.open{transform:translateX(0)}
  .sb-overlay{display:block}
  .main{flex:1;display:flex;flex-direction:column;overflow:hidden;width:100%;max-width:100vw}
  .content{padding:12px 10px 76px;overflow-x:hidden;overflow-y:auto}
  .topbar{padding:10px 12px;gap:8px}
  .tbt{font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:50vw}
  .tbp{display:none}
  .topbar>span[style]{display:none}
  .topbar>.sep{display:none}
  .sg,.wh-stats{grid-template-columns:1fr 1fr !important;gap:8px !important}
  .notif-stats{grid-template-columns:1fr !important;gap:8px !important}
  .g2,.mgrid,.field-g{grid-template-columns:1fr !important}
  .mgrid3{grid-template-columns:1fr 1fr}
  .ag{grid-template-columns:1fr}
  .rg{grid-template-columns:1fr 1fr}
  .pgrid{grid-template-columns:1fr 1fr}
  .frow{grid-template-columns:1fr}
  .sc{padding:12px 14px}
  .sn{font-size:20px}
  .card{overflow-x:auto !important}
  .tbl{min-width:520px}
  .tbl th{white-space:nowrap;font-size:9px;padding:7px 8px}
  .tbl td{padding:8px;font-size:12px}
  .nr{flex-wrap:wrap}
  .nr>div:last-child{flex-direction:row !important;justify-content:space-between !important;align-items:center !important;width:100% !important;padding-top:8px !important;border-top:1px solid var(--border);margin-top:4px}
  .nr>div:last-child .ntm{margin:0}
  .req-row{flex-wrap:wrap !important;gap:8px !important}
  .ch{flex-wrap:wrap;gap:6px}
  .kbar{flex-direction:column !important;align-items:stretch !important;gap:10px !important;padding:14px}
  .kbar>.kdiv{display:none !important}
  .kbar-top{display:flex;align-items:flex-start;gap:14px;flex-wrap:wrap}
  .kbar-counts{display:flex;gap:16px;flex-wrap:wrap}
  .kbar-actions{width:100% !important;margin-left:0 !important;flex-wrap:wrap !important;gap:6px}
  .kbar-actions>.btn{flex:1;min-width:100px;justify-content:center;padding:9px 8px !important;font-size:11.5px !important}
  .sh2{flex-wrap:wrap;gap:6px;padding:10px 12px}
  .snum{font-size:12px;width:36px}
  .sloc{font-size:12.5px}
  .stm{font-size:11px}
  .stabs{overflow-x:auto;-webkit-overflow-scrolling:touch}
  .stab{white-space:nowrap;padding:8px 10px;font-size:12px}
  .sp{padding:10px 12px}
  .ir{flex-wrap:wrap;gap:4px;padding:6px 0;align-items:center}
  .kpp-btns{flex-wrap:wrap !important;gap:6px !important}
  .kpp-btns>.btn{flex:1;min-width:130px;justify-content:center !important}
  .mkrow{flex-wrap:wrap;gap:4px}
  .mkchar{min-width:0;font-size:12px;width:100%}
  .mkactor{font-size:11px}
  .mklook{width:100%;font-size:12px}
  .mkcont{white-space:normal;font-size:10px}
  .field-item-row{flex-direction:column !important;align-items:flex-start !important;gap:6px !important}
  .field-item-row .btn{width:100% !important;justify-content:center}
  .ov{padding:0;align-items:flex-end;overflow-y:hidden}
  .modal{border-radius:var(--r2) var(--r2) 0 0;max-height:88vh;overflow-y:auto;max-width:100%;width:100%;margin:0}
  .mbody{padding:14px}
  .mtop{padding:16px 14px 12px}
  .mtabs{overflow-x:auto}
  .mtab{white-space:nowrap}
  .mact{flex-wrap:wrap}
  .mact>.btn{flex:1;justify-content:center}
  .bnav{display:flex;position:fixed;bottom:0;left:0;right:0;background:var(--card);border-top:1px solid var(--border);z-index:100;height:60px;padding:0 4px;padding-bottom:env(safe-area-inset-bottom,0px)}
  .bni{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-size:9px;font-weight:700;color:var(--ink3);cursor:pointer;border-radius:8px;padding:6px 4px;transition:all .15s;min-width:0;border:none;background:none;font-family:'Manrope',sans-serif;letter-spacing:.1px}
  .bni.on{color:var(--blue)}
  .bni-ico{width:24px;height:24px;display:flex;align-items:center;justify-content:center}
  .ni{padding:10px 12px;font-size:13px}
  .scene{margin-bottom:8px}
  .si{width:100% !important;max-width:100%}
  .sw{width:100%}
  .btn{font-size:12px;padding:8px 12px}
  .sdur{font-size:10px;padding:2px 7px}
  .idc{font-size:9.5px}
  .pill{font-size:10px}
}
`;

const Pill=({s})=>{const c=sc(s);return <span className="pill" style={{background:c.bg,color:c.tx}}><span className="dot" style={{background:c.d}}/>{s}</span>;};
const Cell=({wh,cell})=><span className="cellc"><I n="grid" s={11} c="#00AEEF"/>{wh} · {cell}</span>;

function ItemModal({item,onClose}){
  const hist=[{d:"14.02.2025",t:`Выдан — ${item.issuedTo||"н/д"} · ${item.project||"—"}`,a:true},{d:"01.02.2025",t:"Возврат — состояние Хорошее",a:false},{d:"15.01.2025",t:"Выдан — Козлова Е.В. · ДЕТЕКТИВ-2",a:false},{d:"10.01.2025",t:"Постановка на учёт · 3 фото",a:false}];
  return(<div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}><div className="modal">
    <div className="mtop"><div><div className="mtitle">{item.name}</div><div className="mid">{item.id}</div></div><button className="xbtn" onClick={onClose}><I n="x" s={15}/></button></div>
    <div className="mtabs">{["Карточка","Фотографии","История"].map((t,i)=><span key={t} className={`mtab ${i===0?"on":""}`}>{t}</span>)}</div>
    <div className="mbody">
      <div className="mgrid">{[["Статус",<Pill s={item.status}/>],["Состояние",item.cond],["Категория",item.cat],["Стоимость",`${item.val?.toLocaleString()} руб`],["Происхождение",item.origin],["Фотографии",`${item.photos} фото`]].map(([l,v])=><div key={l}><div className="mfl">{l}</div><div className="mfv">{v}</div></div>)}</div>
      {item.wh&&<div className="ibox" style={{background:"rgba(124,58,237,.06)",borderColor:"#7c3aed"}}><div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".8px",color:"#7c3aed",marginBottom:4}}>МЕСТОНАХОЖДЕНИЕ</div><div style={{display:"flex",alignItems:"center",gap:10}}><Cell wh={item.wh} cell={item.cell}/><span style={{fontSize:12.5,fontWeight:600,color:"#334155"}}>{item.wh}, ячейка {item.cell}</span></div></div>}
      {item.unique&&<div className="ibox" style={{background:"rgba(37,99,235,.06)",borderColor:"#00AEEF"}}><div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".8px",color:"#00AEEF",marginBottom:3}}>УНИКАЛЬНЫЕ ПРИЗНАКИ</div><div style={{fontSize:13,fontWeight:600}}>{item.unique}</div></div>}
      {item.tags&&<div style={{marginBottom:12}}><div className="mfl">ТЕГИ</div><div style={{marginTop:3}}>{item.tags.map(t=><span key={t} className="tag">{t}</span>)}</div></div>}
      <div className="pgrid">{Array.from({length:item.photos}).map((_,i)=><div key={i} className="pph"><I n="cam" s={20} c="#d1d5db"/><span style={{fontSize:10.5,fontWeight:600,color:"#94a3b8"}}>Фото {i+1}</span></div>)}</div>
      <div className="mfl" style={{marginBottom:7}}>ИСТОРИЯ</div>
      {hist.map((h,i)=><div key={i} className="hrow"><div className="hdot" style={{background:h.a?"#00AEEF":"#d1d5db"}}/><div><div className="hdate">{h.d}</div><div className="htxt">{h.t}</div></div></div>)}
      {item.issuedTo&&<div className="ibox" style={{background:"rgba(217,119,6,.07)",borderColor:"#d97706",marginTop:12}}><div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".8px",color:"#d97706",marginBottom:5}}>ТЕКУЩАЯ ВЫДАЧА</div><div style={{fontSize:13,fontWeight:600,lineHeight:1.9}}>Получатель: {item.issuedTo}<br/>Проект: {item.project} · {item.block}<br/><span style={{color:"#dc2626"}}>Вернуть до: {item.returnDate}</span></div></div>}
      <div className="mact"><button className="btn bp sm"><I n="ul" s={13} c="#fff"/>Выдать</button><button className="btn bg sm"><I n="dl" s={13}/>Вернуть</button><button className="btn bg sm"><I n="edit" s={13}/>Ред.</button><button className="btn bg sm" style={{marginLeft:"auto"}}><I n="doc" s={13}/>PDF</button></div>
    </div>
  </div></div>);
}

function NotifModal({n,onClose}){
  const item=ITEMS.find(i=>i.id===n.itemId);
  const lc={crit:{bg:"#fee2e2",bc:"#dc2626",lbl:"КРИТИЧЕСКОЕ",c:"#dc2626"},warn:{bg:"#fef3c7",bc:"#d97706",lbl:"ПРЕДУПРЕЖДЕНИЕ",c:"#d97706"},info:{bg:"#E6F7FD",bc:"#00AEEF",lbl:"ИНФОРМАЦИЯ",c:"#00AEEF"}}[n.lv];
  return(<div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}><div className="modal">
    <div className="mtop"><div><div style={{fontSize:10.5,fontWeight:700,textTransform:"uppercase",letterSpacing:".8px",color:lc.c,marginBottom:4}}>{lc.lbl}</div><div className="mtitle">{n.title}</div></div><button className="xbtn" onClick={onClose}><I n="x" s={15}/></button></div>
    <div className="mbody">
      <div className="mfl" style={{marginBottom:7}}>ПРЕДМЕТ</div>
      <div style={{background:"#f8f8fc",borderRadius:"10px",border:"1px solid rgba(0,0,0,.05)",padding:"11px 14px",marginBottom:16,display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:38,height:38,borderRadius:10,background:"#E6F7FD",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><I n="box" s={18} c="#00AEEF"/></div>
        <div style={{flex:1}}><div style={{fontSize:13.5,fontWeight:700}}>{n.itemName}</div><div style={{fontSize:11.5,fontFamily:"'JetBrains Mono',monospace",color:"#94a3b8",marginTop:1}}>{n.itemId}</div></div>
        {item&&<Cell wh={item.wh} cell={item.cell}/>}
      </div>
      <div className="mfl" style={{marginBottom:7}}>У КОГО НАХОДИТСЯ</div>
      <div style={{background:"#f8f8fc",borderRadius:"10px",border:"1px solid rgba(0,0,0,.05)",padding:"14px",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          <div style={{width:42,height:42,borderRadius:"50%",background:"linear-gradient(135deg,#00AEEF,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{color:"#fff",fontWeight:800,fontSize:13}}>{n.who.slice(0,2)}</span></div>
          <div><div style={{fontSize:15,fontWeight:800}}>{n.who}</div><div style={{fontSize:12,color:"#94a3b8",marginTop:2,fontWeight:500}}>{n.role} · {n.project}</div></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <div><div className="mfl">ТЕЛЕФОН</div><div style={{fontSize:13,fontWeight:700,fontFamily:"'JetBrains Mono',monospace"}}><a href={`tel:${n.phone}`} style={{color:"inherit",textDecoration:"none"}}>{n.phone}</a></div></div>
          <div><div className="mfl">ВЕРНУТЬ ДО</div><div style={{fontSize:13,fontWeight:800,color:n.lv==="crit"?"#dc2626":n.lv==="warn"?"#d97706":"#0f172a"}}>{n.returnDate}</div></div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <a href={`tel:${n.phone}`} className="cbtn" style={{background:"#dcfce7",color:"#16a34a",textDecoration:"none"}}><I n="phone" s={15} c="#16a34a"/>Позвонить</a>
          <a href={`mailto:`} className="cbtn" style={{background:"#E6F7FD",color:"#00AEEF",textDecoration:"none"}}><I n="mail" s={15} c="#00AEEF"/>Написать</a>
        </div>
      </div>
      {n.lv!=="info"&&<div className="ibox" style={{background:lc.bg,borderColor:lc.bc}}><div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".8px",color:lc.c,marginBottom:3}}>ТРЕБУЕТСЯ ДЕЙСТВИЕ</div><div style={{fontSize:13,fontWeight:600}}>{n.lv==="crit"?"Свяжитесь с получателем и потребуйте немедленного возврата.":`Напомните о возврате. Срок: ${n.returnDate}`}</div></div>}
      <div className="mact"><button className="btn bp sm"><I n="chk" s={13} c="#fff"/>Решить</button><button className="btn bg sm" onClick={onClose}>Закрыть</button></div>
    </div>
  </div></div>);
}

function SceneEditModal({scene,onSave,onClose}){
  const [f,setF]=useState({loc:scene.loc,date:scene.date,time:scene.time,dur:scene.dur,desc:scene.desc});
  const [items,setItems]=useState(scene.items.map(x=>({...x})));
  const [makeup,setMakeup]=useState(scene.makeup.map(x=>({...x})));
  const upd=(k,v)=>setF(p=>({...p,[k]:v}));
  const updI=(i,k,v)=>setItems(p=>p.map((x,j)=>j===i?{...x,[k]:v}:x));
  const delI=i=>setItems(p=>p.filter((_,j)=>j!==i));
  const updM=(i,k,v)=>setMakeup(p=>p.map((x,j)=>j===i?{...x,[k]:v}:x));
  const delM=i=>setMakeup(p=>p.filter((_,j)=>j!==i));
  const save=()=>{onSave({...scene,...f,items,makeup});onClose();};
  return(<div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}><div className="modal modal-wide">
    <div className="mtop"><div><div style={{fontSize:11,color:"#94a3b8",fontWeight:600,marginBottom:3}}>РЕДАКТИРОВАТЬ СЦЕНУ</div><div className="mtitle">Сцена {scene.id}</div></div><button className="xbtn" onClick={onClose}><I n="x" s={15}/></button></div>
    <div className="mbody">
      <div style={{fontSize:10.5,fontWeight:700,textTransform:"uppercase",letterSpacing:".7px",color:"#94a3b8",marginBottom:8}}>ОСНОВНОЕ</div>
      <div className="frow" style={{marginBottom:0}}>
        <div className="fg"><label className="fl">Локация</label><input className="fi" value={f.loc} onChange={e=>upd("loc",e.target.value)}/></div>
        <div className="fg"><label className="fl">Описание</label><input className="fi" value={f.desc} onChange={e=>upd("desc",e.target.value)}/></div>
      </div>
      <div className="mgrid3" style={{marginBottom:14}}>
        <div><label className="fl">Дата</label><input className="fi" value={f.date} onChange={e=>upd("date",e.target.value)}/></div>
        <div><label className="fl">Время начала</label><input className="fi" value={f.time} onChange={e=>upd("time",e.target.value)}/></div>
        <div><label className="fl">Хронометраж</label><input className="fi" value={f.dur} onChange={e=>upd("dur",e.target.value)}/></div>
      </div>
      <div style={{fontSize:10.5,fontWeight:700,textTransform:"uppercase",letterSpacing:".7px",color:"#94a3b8",marginBottom:8}}>РЕКВИЗИТ И КОСТЮМЫ</div>
      {items.map((it,i)=>(<div key={i} className="erow">
        <select className="fi" style={{width:100,flex:"none"}} value={it.dept} onChange={e=>updI(i,"dept",e.target.value)}><option>реквизит</option><option>костюм</option><option>транспорт</option></select>
        <input className="fi" value={it.name} onChange={e=>updI(i,"name",e.target.value)}/>
        <select className="fi" style={{width:130,flex:"none"}} value={it.status} onChange={e=>updI(i,"status",e.target.value)}>{["На складе","Постоянный","Частично","Нет","Изготовить","Сделать","Поставщик"].map(s=><option key={s}>{s}</option>)}</select>
        <button className="btn br sm" style={{padding:"5px 8px",flex:"none"}} onClick={()=>delI(i)}><I n="trash" s={13} c="#dc2626"/></button>
      </div>))}
      <button className="btn bg sm" style={{marginBottom:14}} onClick={()=>setItems(p=>[...p,{name:"Новая позиция",dept:"реквизит",status:"На складе",note:""}])}><I n="plus" s={13}/>Добавить позицию</button>
      <div style={{fontSize:10.5,fontWeight:700,textTransform:"uppercase",letterSpacing:".7px",color:"#94a3b8",marginBottom:8}}>ГРИМ</div>
      {makeup.map((m,i)=>(<div key={i} className="erow">
        <input className="fi" placeholder="Персонаж" value={m.char} onChange={e=>updM(i,"char",e.target.value)}/>
        <input className="fi" placeholder="Актёр" value={m.actor} onChange={e=>updM(i,"actor",e.target.value)}/>
        <input className="fi" placeholder="Описание грима" value={m.look} onChange={e=>updM(i,"look",e.target.value)}/>
        <button className="btn br sm" style={{padding:"5px 8px",flex:"none"}} onClick={()=>delM(i)}><I n="trash" s={13} c="#dc2626"/></button>
      </div>))}
      <button className="btn bg sm" style={{marginBottom:14}} onClick={()=>setMakeup(p=>[...p,{char:"",actor:"",look:"",cont:"-"}])}><I n="plus" s={13}/>Добавить грим</button>
      <div className="mact"><button className="btn bp" onClick={save}><I n="save" s={14} c="#fff"/>Сохранить изменения</button><button className="btn bg" onClick={onClose}>Отмена</button></div>
    </div>
  </div></div>);
}

function AddModal({onClose,onAdded}){
  const [f,setF]=useState({type:"PRO",cat:"Декор",name:"",wh:"Склад А",cell:"",origin:"Закупка",val:"",unique:""});
  const [loading,setLoading]=useState(false);const [err,setErr]=useState(null);
  const set=k=>e=>setF(p=>({...p,[k]:e.target.value}));
  const save=async()=>{
    if(!f.name.trim()){setErr("Введите название");return;}
    setLoading(true);setErr(null);
    const prefix=f.type==="PRO"?"PRO":"COS";
    const code=`${prefix}-${Date.now().toString().slice(-5)}`;
    try{
      const item=await apiFetch("/items",{method:"POST",body:{code,name:f.name,category:f.cat,condition:"Хорошее",value:parseInt(f.val)||0,origin:f.origin,unique_marks:f.unique,warehouse:f.wh,cell:f.cell}});
      onAdded&&onAdded(item);onClose();
    }catch(e){setErr(e?.error||"Ошибка сохранения");setLoading(false);}
  };
  return(<div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}><div className="modal">
    <div className="mtop"><div><div style={{fontSize:11,color:"#94a3b8",fontWeight:600,marginBottom:3}}>НОВАЯ ЕДИНИЦА</div><div className="mtitle">Поставить на учёт</div></div><button className="xbtn" onClick={onClose}><I n="x" s={15}/></button></div>
    <div className="mbody">
      <div className="frow"><div className="fg"><label className="fl">Тип базы</label><select className="fi" value={f.type} onChange={set("type")}><option value="PRO">Реквизит (PRO)</option><option value="COS">Костюм (COS)</option></select></div><div className="fg"><label className="fl">Категория</label><select className="fi" value={f.cat} onChange={set("cat")}><option>Декор</option><option>Мебель</option><option>Техника</option><option>Оружие/бутафория</option><option>Форма/мундир</option><option>Медоборудование</option><option>Документы</option></select></div></div>
      <div className="fg"><label className="fl">Название</label><input className="fi" placeholder="Ваза напольная, белая, керамика h=60 см" value={f.name} onChange={set("name")}/></div>
      <div className="frow"><div className="fg"><label className="fl">Склад</label><select className="fi" value={f.wh} onChange={set("wh")}><option>Склад А</option><option>Склад Б</option><option>Склад Костюмов</option></select></div><div className="fg"><label className="fl">Ячейка</label><input className="fi" placeholder="A-01" value={f.cell} onChange={set("cell")}/></div></div>
      <div className="frow"><div className="fg"><label className="fl">Происхождение</label><select className="fi" value={f.origin} onChange={set("origin")}><option>Закупка</option><option>Собственный склад</option><option>Аренда</option><option>Бутафорский цех</option><option>Оценка</option></select></div><div className="fg"><label className="fl">Стоимость (руб)</label><input className="fi" type="number" placeholder="0" value={f.val} onChange={set("val")}/></div></div>
      <div className="fg"><label className="fl">Уникальные признаки</label><input className="fi" placeholder="Скол на дне слева" value={f.unique} onChange={set("unique")}/></div>
      {err&&<div style={{background:"#fee2e2",borderRadius:8,padding:"8px 12px",marginBottom:10,fontSize:12,color:"#dc2626",fontWeight:700}}>{err}</div>}
      <div style={{display:"flex",gap:7}}><button className="btn bp" style={{flex:1}} onClick={save} disabled={loading}><I n="chk" s={14} c="#fff"/>{loading?"Сохраняем...":"Поставить на учёт"}</button><button className="btn bg" onClick={onClose}>Отмена</button></div>
    </div>
  </div></div>);
}

function AssetModal({item,onClose,fields}){
  return(<div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}><div className="modal">
    <div className="mtop"><div><div className="mtitle">{item.name}</div><div className="mid">{item.id}</div></div><button className="xbtn" onClick={onClose}><I n="x" s={15}/></button></div>
    <div className="mbody">
      <div className="mgrid">{fields.map(([l,v])=><div key={l}><div className="mfl">{l}</div><div className="mfv">{v}</div></div>)}</div>
      {item.limits&&<div className="ibox" style={{background:"#fee2e2",borderColor:"#dc2626"}}><div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".8px",color:"#dc2626",marginBottom:3}}>ОГРАНИЧЕНИЯ</div><div style={{fontSize:13,fontWeight:600}}>{item.limits}</div></div>}
      {item.inventory&&<div><div className="mfl" style={{marginBottom:6}}>ЧТО ЕСТЬ НА ЛОКАЦИИ</div><div style={{background:"#f8f8fc",borderRadius:"10px",border:"1px solid rgba(0,0,0,.05)",padding:"11px 14px",fontSize:12.5,color:"#334155",lineHeight:1.75,fontWeight:500,marginBottom:12}}>{item.inventory}</div></div>}
      <div className="mfl" style={{marginBottom:7}}>ИСТОРИЯ В ПРОЕКТАХ</div>
      <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:14}}>{item.history.map(h=><span key={h} style={{background:"#E6F7FD",color:"#00AEEF",fontSize:12,fontWeight:700,padding:"3px 10px",borderRadius:7}}>{h}</span>)}</div>
      <div className="mfl" style={{marginBottom:7}}>ФОТОГРАФИИ ({item.photos})</div>
      <div className="pgrid">{Array.from({length:Math.min(item.photos,6)}).map((_,i)=><div key={i} className="pph"><I n="img" s={20} c="#d1d5db"/><span style={{fontSize:10.5,fontWeight:600,color:"#94a3b8"}}>Фото {i+1}</span></div>)}</div>
      <div className="mact"><button className="btn bp sm">Запросить / Забронировать</button><button className="btn bg sm"><I n="edit" s={13}/>Ред.</button></div>
    </div>
  </div></div>);
}

function HomeView(){
  const [selItem,setSelItem]=useState(null);
  const onStock=ITEMS.filter(i=>i.status==="На складе").length;
  const issued=ITEMS.filter(i=>i.status==="Выдан").length;
  const totalVal=ITEMS.reduce((s,i)=>s+(i.val||0),0);
  return(<div>
    <div className="sg">{[{ico:"box",num:onStock,lbl:"На складе",bg:"#dcfce7",ic:"#16a34a"},{ico:"ul",num:issued,lbl:"Выдано",bg:"#fef3c7",ic:"#d97706"},{ico:"bell",num:NOTIFS.length,lbl:"Уведомлений",bg:"#fee2e2",ic:"#dc2626"},{ico:"tag",num:totalVal.toLocaleString()+" руб",lbl:"Стоимость склада",bg:"#E6F7FD",ic:"#00AEEF"}].map(s=>(<div key={s.lbl} className="sc"><div className="sib" style={{background:s.bg}}><I n={s.ico} s={17} c={s.ic}/></div><div className="sn" style={{color:s.ic}}>{s.num}</div><div className="sl">{s.lbl}</div></div>))}</div>
    <div className="g2">
      <div className="card">
        <div className="ch"><span className="ct">Активные проекты</span></div>
        {[{name:"НАШ СПЕЦНАЗ-4",type:"Сериал",bl:3,tot:8},{name:"ДЕТЕКТИВ-2",type:"Сериал",bl:1,tot:6},{name:"ТИХАЯ ГАВАНЬ",type:"Полный метр",bl:0,tot:4}].map(p=>(<div key={p.name} style={{padding:"11px 16px",borderBottom:"1px solid rgba(0,0,0,.05)"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
            <div><div style={{fontSize:13.5,fontWeight:800}}>{p.name}</div><div style={{fontSize:11.5,color:"#94a3b8",marginTop:1,fontWeight:500}}>{p.type} · Блок {p.bl} из {p.tot}</div></div>
            <span style={{fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:20,background:p.bl>0?"#dcfce7":"rgba(0,0,0,.05)",color:p.bl>0?"#16a34a":"#94a3b8"}}>{p.bl>0?"В работе":"Подготовка"}</span>
          </div>
          <div className="pg"><div className="pf" style={{width:`${(p.bl/p.tot)*100}%`,background:p.bl>0?"#00AEEF":"#94a3b8"}}/></div>
        </div>))}
      </div>
      <div className="card">
        <div className="ch"><span className="ct">Уведомления</span><span className="cs">{NOTIFS.length} активных</span></div>
        {NOTIFS.map(n=>{const cfg={crit:{bg:"rgba(220,38,38,.09)",c:"#dc2626"},warn:{bg:"rgba(217,119,6,.09)",c:"#d97706"},info:{bg:"rgba(37,99,235,.08)",c:"#00AEEF"}}[n.lv];return(<div key={n.id} className="nr"><div className="ni2" style={{background:cfg.bg}}><I n={n.ico} s={16} c={cfg.c}/></div><div style={{flex:1}}><div className="ntt">{n.title}</div><div className="nb">{n.body}</div><div className="nm"><span>{n.who}</span><span>·</span><span>{n.project}</span></div></div><span className="ntm">{n.time} назад</span></div>);})}
      </div>
    </div>
    <div className="card">
      <div className="ch"><span className="ct">Активные выдачи</span><span className="cs">нажмите строку — откроется карточка</span></div>
      <table className="tbl">
        <thead><tr><th>ID</th><th>Единица</th><th>Получатель</th><th>Склад · Ячейка</th><th>Вернуть до</th><th>Статус</th></tr></thead>
        <tbody>{ITEMS.filter(i=>i.status==="Выдан").map(i=>(<tr key={i.id} onClick={()=>setSelItem(i)}><td><span className="idc">{i.id}</span></td><td style={{fontWeight:700}}>{i.name}</td><td style={{color:"#334155",fontWeight:500}}>{i.issuedTo}</td><td><Cell wh={i.wh} cell={i.cell}/></td><td style={{color:"#dc2626",fontWeight:800,fontSize:12.5}}>{i.returnDate}</td><td><Pill s={i.status}/></td></tr>))}</tbody>
      </table>
    </div>
    {selItem&&<ItemModal item={selItem} onClose={()=>setSelItem(null)}/>}
  </div>);
}

function InvView({type}){
  const [q,setQ]=useState("");const [sel,setSel]=useState(null);const [add,setAdd]=useState(false);
  const items=ITEMS.filter(i=>(type==="c"?i.id.startsWith("COS"):!i.id.startsWith("COS"))&&(!q||i.name.toLowerCase().includes(q.toLowerCase())||i.id.toLowerCase().includes(q.toLowerCase())));
  const exportCSV=()=>{
    const hdr="ID,Название,Категория,Склад,Ячейка,Статус,Состояние,Стоимость";
    const rows=items.map(i=>[i.id,i.name,i.cat||"",i.wh||"",i.cell||"",i.status||"",i.cond||"",i.val||0].map(v=>`"${v}"`).join(","));
    const csv=[hdr,...rows].join("\n");
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"}));
    a.download=`${type==="c"?"костюмы":"реквизит"}_${new Date().toLocaleDateString("ru")}.csv`;a.click();
  };
  return(<div>
    <div style={{display:"flex",gap:7,marginBottom:12,alignItems:"center"}}>
      <div className="sw"><span className="sico"><I n="search" s={14}/></span><input className="si" value={q} onChange={e=>setQ(e.target.value)} placeholder={type==="c"?"Поиск по костюмам...":"Поиск по реквизиту..."}/></div>
      <button className="btn bg sm"><I n="sliders" s={13}/>Фильтры</button>
      <button className="btn bg sm" onClick={exportCSV}><I n="dl" s={13}/>Экспорт</button>
      <button className="btn bp sm" style={{marginLeft:"auto"}} onClick={()=>setAdd(true)}><I n="plus" s={13} c="#fff"/>Поставить на учёт</button>
    </div>
    <div className="card">
      <table className="tbl">
        <thead><tr><th>ID</th><th>Название</th><th>Склад · Ячейка</th><th>Статус</th><th>Состояние</th><th>Стоимость</th></tr></thead>
        <tbody>{items.map(i=>(<tr key={i.id} onClick={()=>setSel(i)}><td><span className="idc">{i.id}</span></td><td><div style={{fontWeight:700}}>{i.name}</div>{i.issuedTo&&<div style={{fontSize:11,color:"#94a3b8",marginTop:1,fontWeight:500}}>→ {i.issuedTo} · {i.project}</div>}</td><td><Cell wh={i.wh} cell={i.cell}/></td><td><Pill s={i.status}/></td><td style={{color:"#334155",fontSize:12.5,fontWeight:500}}>{i.cond}</td><td style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11.5,color:"#00AEEF",fontWeight:500}}>{i.val?.toLocaleString()} руб</td></tr>))}</tbody>
      </table>
    </div>
    {sel&&<ItemModal item={sel} onClose={()=>setSel(null)}/>}
    {add&&<AddModal onClose={()=>setAdd(false)}/>}
  </div>);
}

function NotifsView(){
  const [notifs,setNotifs]=useState(NOTIFS);
  const [sel,setSel]=useState(null);

  useEffect(()=>{
    apiFetch("/notifications").then(rows=>{
      if(rows.length>0) setNotifs(rows.map(r=>({
        id:r.id,lv:r.level||"info",ico:r.level==="crit"?"alert":r.level==="warn"?"clk":"bell",
        title:r.title,body:r.body,who:r.who||"",role:r.role||"",project:r.project||"",
        time:r.created_at?new Date(r.created_at).toLocaleDateString("ru"):"",
        is_read:r.is_read,
      })));
    }).catch(()=>{});
  },[]);

  const markRead=async(id,e)=>{
    e.stopPropagation();
    apiFetch(`/notifications/${id}/read`,{method:"PATCH"}).catch(()=>{});
    setNotifs(p=>p.filter(n=>n.id!==id));
  };

  const crit=notifs.filter(n=>n.lv==="crit").length;
  const warn=notifs.filter(n=>n.lv==="warn").length;
  const info=notifs.filter(n=>!["crit","warn"].includes(n.lv)).length;

  return(<div>
    <div className="notif-stats">
      {[["#dc2626","#fee2e2","alert","Критические",crit],["#d97706","#fef3c7","clk","Предупреждения",warn],["#00AEEF","#E6F7FD","bell","Информационные",info]].map(([tc,bg,ico,lb,ct])=>(<div key={lb} style={{background:bg,borderRadius:"14px",padding:"14px 16px",display:"flex",gap:12,alignItems:"center",border:`1px solid ${tc}33`}}><div style={{width:40,height:40,borderRadius:10,background:tc+"22",display:"flex",alignItems:"center",justifyContent:"center"}}><I n={ico} s={18} c={tc}/></div><div><div style={{fontSize:26,fontWeight:800,color:tc,letterSpacing:"-1px",lineHeight:1}}>{ct}</div><div style={{fontSize:12,color:tc,opacity:.75,marginTop:2,fontWeight:700}}>{lb}</div></div></div>))}
    </div>
    <div className="card">
      <div className="ch"><span className="ct">Все уведомления</span><span className="cs">нажмите — откроется карточка</span></div>
      {notifs.length===0&&<div style={{textAlign:"center",padding:"30px",color:"#94a3b8",fontWeight:600}}>Нет уведомлений</div>}
      {notifs.map(n=>{const cfg={crit:{bg:"rgba(220,38,38,.09)",c:"#dc2626"},warn:{bg:"rgba(217,119,6,.09)",c:"#d97706"},info:{bg:"rgba(37,99,235,.08)",c:"#00AEEF"}}[n.lv]||{bg:"rgba(37,99,235,.08)",c:"#00AEEF"};return(<div key={n.id} className="nr" onClick={()=>setSel(n)}><div className="ni2" style={{background:cfg.bg}}><I n={n.ico} s={16} c={cfg.c}/></div><div style={{flex:1}}><div className="ntt">{n.title}</div><div className="nb">{n.body}</div><div className="nm"><span>{n.who}</span>{n.role&&<><span>·</span><span>{n.role}</span></>}{n.project&&<><span>·</span><span>{n.project}</span></>}</div></div><div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:7}}><span className="ntm">{n.time}</span><div style={{display:"flex",gap:5}}><button className="btn bg sm" onClick={e=>markRead(n.id,e)}>Закрыть</button><button className="btn bp sm" onClick={e=>{e.stopPropagation();setSel(n);}}>Открыть</button></div></div></div>);})}
    </div>
    {sel&&<NotifModal n={sel} onClose={()=>setSel(null)}/>}
  </div>);
}

function KPPView(){
  const [scenes,setScenes]=useState(KPP_INIT);
  const [open,setOpen]=useState({"46-1":true});
  const [stab,setStab]=useState({});
  const [editScene,setEditScene]=useState(null);
  const [selItem,setSelItem]=useState(null);
  const [uploading,setUploading]=useState(false);
  const [uploadMsg,setUploadMsg]=useState(null);
  const kppInputRef=useRef(null);
  const scriptInputRef=useRef(null);

  const tog=id=>setOpen(p=>({...p,[id]:!p[id]}));
  const gtab=id=>stab[id]||"items";
  const settab=(id,t)=>setStab(p=>({...p,[id]:t}));
  const saveScene=updated=>setScenes(p=>p.map(s=>s.id===updated.id?updated:s));
  const findItem=ref=>ITEMS.find(i=>i.id===ref);
  const all=scenes.flatMap(s=>s.items);
  const cn={ok:all.filter(i=>["На складе","Постоянный"].includes(i.status)).length,par:all.filter(i=>["Частично","Сделать"].includes(i.status)).length,no:all.filter(i=>["Нет","Изготовить"].includes(i.status)).length,sup:all.filter(i=>i.status==="Поставщик").length};

  const uploadFile=async(file,doc_type)=>{
    if(!file)return;
    setUploading(true);setUploadMsg(null);
    const fd=new FormData();fd.append("file",file);fd.append("doc_type",doc_type);
    try{
      const token=localStorage.getItem("access_token");
      const res=await fetch(`${API}/kpp/upload`,{method:"POST",headers:token?{Authorization:`Bearer ${token}`}:{},body:fd});
      const data=await res.json();
      if(!res.ok)throw data;
      setUploadMsg({ok:true,text:`Файл "${data.filename}" загружен`});
    }catch(e){setUploadMsg({ok:false,text:e?.error||"Ошибка загрузки"});}
    finally{setUploading(false);}
  };

  return(<div>
    {uploadMsg&&<div style={{marginBottom:10,padding:"10px 14px",borderRadius:8,background:uploadMsg.ok?"#dcfce7":"#fee2e2",color:uploadMsg.ok?"#16a34a":"#dc2626",fontWeight:700,fontSize:13,display:"flex",justifyContent:"space-between"}}>
      {uploadMsg.text}<button onClick={()=>setUploadMsg(null)} style={{background:"none",border:"none",cursor:"pointer",color:"inherit"}}><I n="x" s={14}/></button>
    </div>}
    <input ref={kppInputRef} type="file" style={{display:"none"}} accept=".pdf,.xlsx,.xls,.png,.jpg" onChange={e=>{uploadFile(e.target.files[0],"kpp");e.target.value="";}}/>
    <input ref={scriptInputRef} type="file" style={{display:"none"}} accept=".pdf,.txt" onChange={e=>{uploadFile(e.target.files[0],"script");e.target.value="";}}/>
    <div className="kbar">
      <div className="kbar-top">
        <div><div style={{fontSize:10,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"1px",marginBottom:2}}>СЪЁМОЧНЫЙ ДЕНЬ</div><div className="kdate">08-09.02.2025</div></div>
        <div className="kdiv"/>
        <div><div style={{fontSize:11.5,color:"#94a3b8",fontWeight:500}}>Проект</div><div style={{fontSize:14.5,fontWeight:800}}>НАШ СПЕЦНАЗ-4 · Блок 3</div></div>
      </div>
      <div className="kbar-counts">
        {[["#16a34a",cn.ok,"На складе"],["#d97706",cn.par,"Частично"],["#dc2626",cn.no,"Нет"],["#00AEEF",cn.sup,"Поставщик"]].map(([c,n,l])=>(<div key={l} className="kcnt"><div className="kcn" style={{color:c}}>{n}</div><div className="kcl">{l}</div></div>))}
      </div>
      <div className="kbar-actions">
        <button className="btn bg sm" disabled={uploading} onClick={()=>kppInputRef.current?.click()}><I n="dl" s={13}/>{uploading?"Загрузка...":"Загрузить КПП"}</button>
        <button className="btn bg sm" disabled={uploading} onClick={()=>scriptInputRef.current?.click()}><I n="doc" s={13}/>Загрузить сценарий</button>
        <button className="btn bp sm"><I n="send" s={13} c="#fff"/>Экспорт</button>
      </div>
    </div>
    {scenes.map(s=>(<div key={s.id} className="scene">
      <div className="sh2">
        <div style={{display:"flex",alignItems:"center",gap:10,flex:1,cursor:"pointer"}} onClick={()=>tog(s.id)}>
          <div className="snum">{s.id}</div>
          <span className="stag2" style={{background:s.type==="НАТ"?"#dcfce7":"#E6F7FD",color:s.type==="НАТ"?"#16a34a":"#00AEEF"}}>{s.type}</span>
          <div style={{flex:1}}>
            <div className="sloc">{s.loc}</div>
            <div className="stm">{s.date} · {s.time} · {s.desc}</div>
          </div>
        </div>
        <span className="sdur"><I n="clk" s={12} c="#334155"/>{s.dur}</span>
        {s.items.some(i=>["Нет","Изготовить"].includes(i.status))&&<span style={{marginRight:4}}><Pill s="Нет"/></span>}
        {s.items.some(i=>["Частично","Сделать"].includes(i.status))&&<span style={{marginRight:4}}><Pill s="Частично"/></span>}
        <button className="btn bg sm" style={{padding:"4px 9px",marginRight:6}} onClick={e=>{e.stopPropagation();setEditScene(s);}}><I n="edit" s={13}/>Изменить</button>
        <div style={{cursor:"pointer"}} onClick={()=>tog(s.id)}><I n={open[s.id]?"cd":"cr"} s={17} c="#94a3b8"/></div>
      </div>
      {open[s.id]&&(<div className="sbody">
        <div className="stabs">
          <button className={`stab ${gtab(s.id)==="items"?"on":""}`} onClick={()=>settab(s.id,"items")}>Реквизит и костюмы</button>
          <button className={`stab ${gtab(s.id)==="makeup"?"on":""}`} onClick={()=>settab(s.id,"makeup")}>Грим</button>
        </div>
        {gtab(s.id)==="items"&&(<div className="sp">
          <div className="sptitle"><I n="box" s={12} c="#94a3b8"/>Реквизит и костюмы · нажмите название для карточки</div>
          {s.items.map((it,i)=>{const linked=it.ref?findItem(it.ref):null;return(<div key={i} className="ir">
            <span className="dtag" style={{background:dc(it.dept).bg,color:dc(it.dept).tx}}>{it.dept}</span>
            <div style={{flex:1}}>
              <div className={linked?"in":""} style={!linked?{fontSize:"12.5px",fontWeight:600}:{}} onClick={()=>linked&&setSelItem(linked)}>{it.name}</div>
              {it.note&&<div className="inote">{it.note}</div>}
              {it.ref&&<span className="idc" style={{fontSize:10,marginTop:2,display:"inline-block"}}>{it.ref}</span>}
            </div>
            <Pill s={it.status}/>
          </div>);})}
          <div className="kpp-btns">
            <button className="btn bp sm"><I n="chk" s={13} c="#fff"/>Создать запросы</button>
            <button className="btn bg sm"><I n="send" s={13}/>Запрос поставщику</button>
            <button className="btn bg sm"><I n="dl" s={13}/>Список закупки</button>
          </div>
        </div>)}
        {gtab(s.id)==="makeup"&&(<div className="sp">
          <div className="sptitle"><I n="face" s={12} c="#94a3b8"/>Грим по сцене</div>
          {s.makeup.map((m,i)=>(<div key={i} className="mkrow"><div style={{minWidth:110,flexShrink:0}}><div className="mkchar">{m.char}</div><div className="mkactor">{m.actor}</div></div><div className="mklook">{m.look}</div>{m.cont!=="-"&&<span className="mkcont">{m.cont}</span>}</div>))}
        </div>)}
      </div>)}
    </div>))}
    {editScene&&<SceneEditModal scene={editScene} onSave={saveScene} onClose={()=>setEditScene(null)}/>}
    {selItem&&<ItemModal item={selItem} onClose={()=>setSelItem(null)}/>}
  </div>);
}

function AssetGrid({items,getFields,btn}){
  const [sel,setSel]=useState(null);
  return(<><div className="ag">{items.map(item=>(<div key={item.id} className="ac" onClick={()=>setSel(item)}>
    <div className="athumb" style={{background:item.grad}}><I n={item.ico} s={50} c="#000"/></div>
    <div className="abody">
      <div className="aid">{item.id}</div><div className="aname">{item.name}</div><div className="asub">{item.sub}</div>
      {getFields(item).slice(0,5).map(([l,v])=>(<div key={l} className="arow"><span className="arl">{l}</span><span className="arv">{v}</span></div>))}
      <div className="ahistt">История в проектах</div>
      <div className="hchips">{item.history.map(h=><span key={h} style={{background:"#E6F7FD",color:"#00AEEF",fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:5}}>{h}</span>)}</div>
    </div>
    <div className="afoot"><button className="btn bp sm" style={{flex:1}}>{btn}</button><button className="btn bg sm" style={{padding:"5px 9px"}}><I n="cam" s={13}/></button></div>
  </div>))}</div>{sel&&<AssetModal item={sel} onClose={()=>setSel(null)} fields={getFields(sel)}/>}</>);
}

const Ph=({p})=>p?<a href={`tel:${p}`} style={{color:"inherit",textDecoration:"none"}}>{p}</a>:null;
function TransportView(){return(<div><div style={{display:"flex",marginBottom:12}}><button className="btn bg sm"><I n="sliders" s={13}/>Фильтры</button><button className="btn bp sm" style={{marginLeft:"auto"}}><I n="plus" s={13} c="#fff"/>Добавить</button></div><AssetGrid items={VEHICLES} btn="Забронировать" getFields={v=>[["Собственник",v.owner],["Телефон",<Ph p={v.phone}/>],["Стоимость",v.price],["КПП",v.gearbox],["Водитель",v.driver]]}/></div>);}
function LocationsView(){return(<div><div style={{display:"flex",marginBottom:12}}><button className="btn bg sm"><I n="sliders" s={13}/>Фильтры</button><button className="btn bp sm" style={{marginLeft:"auto"}}><I n="plus" s={13} c="#fff"/>Добавить</button></div><AssetGrid items={LOCATIONS} btn="Запросить" getFields={l=>[["Адрес",l.address],["Собственник",l.owner],["Телефон",<Ph p={l.phone}/>],["Стоимость",l.price],["Доступ",l.access],["Потолки",l.ceiling]]}/></div>);}
function PartnerView(){return(<div><div style={{display:"flex",marginBottom:12}}><button className="btn bg sm"><I n="sliders" s={13}/>Фильтры</button><button className="btn bp sm" style={{marginLeft:"auto"}}><I n="plus" s={13} c="#fff"/>Добавить</button></div><AssetGrid items={PARTNER_PROPS} btn="Запросить" getFields={p=>[["Поставщик",p.supplier],["Телефон",<Ph p={p.phone}/>],["Стоимость",p.price],["Категория",p.cat],["Состав",p.items]]}/></div>);}

function RolesView(){
  const [roles,setRoles]=useState(ROLES_INIT);
  const [adding,setAdding]=useState(false);
  const [f,setF]=useState({name:"",email:"",pass:"",role:"warehouse"});
  const [loading,setLoading]=useState(false);const [err,setErr]=useState(null);const [ok,setOk]=useState(null);
  const set=k=>e=>setF(p=>({...p,[k]:e.target.value}));
  const addUser=async()=>{
    if(!f.name.trim()||!f.email.trim()||!f.pass.trim()){setErr("Заполните все поля");return;}
    setLoading(true);setErr(null);setOk(null);
    try{
      await apiFetch("/auth/register",{method:"POST",body:{name:f.name,email:f.email,password:f.pass,role:f.role}});
      setOk(`Пользователь ${f.name} создан. Логин: ${f.email}`);
      setF({name:"",email:"",pass:"",role:"warehouse"});
      setTimeout(()=>{setAdding(false);setOk(null);},3000);
    }catch(e){setErr(e?.error||"Ошибка");setLoading(false);}
    setLoading(false);
  };
  return(<div>
    <div className="rg" style={{marginBottom:16}}>
      {roles.map(r=>(<div key={r.name} className="rc"><div className="rico" style={{background:r.bg}}><I n={r.ico} s={15} c={r.g}/></div><span className="rname">{r.name}</span></div>))}
    </div>
    {!adding?(<button className="btn bp" onClick={()=>setAdding(true)}><I n="plus" s={14} c="#fff"/>Создать аккаунт сотрудника</button>):(
    <div className="card" style={{padding:"18px 20px",maxWidth:480}}>
      <div style={{fontWeight:800,fontSize:15,marginBottom:14}}>Новый сотрудник</div>
      <div className="fg"><label className="fl">Имя и фамилия</label><input className="fi" placeholder="Волков Дмитрий" value={f.name} onChange={set("name")}/></div>
      <div className="fg"><label className="fl">Email (логин)</label><input className="fi" type="email" placeholder="d.volkov@3xmedia.ru" value={f.email} onChange={set("email")}/></div>
      <div className="fg"><label className="fl">Пароль</label><input className="fi" type="password" placeholder="Минимум 8 символов" value={f.pass} onChange={set("pass")}/></div>
      <div className="fg"><label className="fl">Роль в системе</label>
        <select className="fi" value={f.role} onChange={set("role")}>
          <option value="admin">Администратор</option>
          <option value="warehouse">Сотрудник склада</option>
          <option value="kpp">КПП / Режиссёрская группа</option>
          <option value="field">Площадка (реквизитор/костюмер)</option>
        </select>
      </div>
      {err&&<div style={{background:"#fee2e2",borderRadius:8,padding:"8px 12px",marginBottom:10,fontSize:12,color:"#dc2626",fontWeight:700}}>{err}</div>}
      {ok&&<div style={{background:"#dcfce7",borderRadius:8,padding:"8px 12px",marginBottom:10,fontSize:12,color:"#16a34a",fontWeight:700}}>✓ {ok}</div>}
      <div style={{display:"flex",gap:8}}>
        <button className="btn bp" onClick={addUser} disabled={loading}><I n="chk" s={14} c="#fff"/>{loading?"Создаём...":"Создать"}</button>
        <button className="btn bg" onClick={()=>{setAdding(false);setErr(null);}}>Отмена</button>
      </div>
    </div>)}
  </div>);
}

/* ── PHOTO UPLOADER ──────────────────────────────────────────────────────── */
function PhotoUploader({ refType, refId, initialPhotos = [] }) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const upload = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    const token = localStorage.getItem("access_token");
    for (const file of Array.from(files)) {
      try {
        const fd = new FormData();
        fd.append("photo", file);
        fd.append("ref_type", refType);
        fd.append("ref_id", String(refId));
        const res = await fetch(`${API}/photos/upload`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: fd,
        });
        const data = await res.json();
        if (res.ok) setPhotos(p => [data, ...p]);
      } catch {/* продолжаем */}
    }
    setUploading(false);
  };

  const remove = async (photo) => {
    try {
      await apiFetch(`/photos/${photo.id}`, { method: "DELETE" });
      setPhotos(p => p.filter(x => x.id !== photo.id));
    } catch {/* ignore */}
  };

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" multiple capture="environment"
        style={{ display: "none" }}
        onChange={e => { upload(e.target.files); e.target.value = ""; }}
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
        {photos.map(p => (
          <div key={p.id} style={{ position: "relative", aspectRatio: "4/3", borderRadius: 8, overflow: "hidden", background: "#f1f5f9" }}>
            <img src={p.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <button onClick={() => remove(p)}
              style={{ position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: "50%", background: "rgba(0,0,0,.6)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <I n="x" s={12} c="#fff" />
            </button>
          </div>
        ))}
        <div onClick={() => !uploading && inputRef.current?.click()}
          style={{ aspectRatio: "4/3", borderRadius: 8, border: "2px dashed rgba(37,99,235,.3)", background: "#E6F7FD", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, cursor: uploading ? "wait" : "pointer", color: "#00AEEF" }}>
          {uploading ? <I n="clk" s={22} c="#00AEEF" /> : <I n="cam" s={22} c="#00AEEF" />}
          <span style={{ fontSize: 11, fontWeight: 700 }}>{uploading ? "Загрузка..." : "Добавить фото"}</span>
        </div>
      </div>
    </div>
  );
}

const NAV=[{s:"ОБЗОР"},{id:"home",ico:"home",lbl:"Главная"},{id:"notifs",ico:"bell",lbl:"Уведомления",badge:3},{s:"СКЛАД"},{id:"warehouse",ico:"arch",lbl:"Кабинет склада",badge:4},{id:"props",ico:"box",lbl:"Реквизит"},{id:"costumes",ico:"hanger",lbl:"Костюмы"},{id:"cells",ico:"grid",lbl:"Карта склада"},{s:"ПРОИЗВОДСТВО"},{id:"kpp",ico:"film",lbl:"Разбор КПП"},{id:"field",ico:"user",lbl:"Кабинет площадки"},{s:"АРЕНДА"},{id:"rental",ico:"tag",lbl:"Аренда реквизита"},{s:"ПАРТНЁРЫ"},{id:"transport",ico:"car",lbl:"Транспорт"},{id:"locations",ico:"pin",lbl:"Локации"},{id:"pprops",ico:"arch",lbl:"Реквизит партнёров"},{s:"КОМАНДА"},{id:"roles",ico:"users",lbl:"Роли"}];
const TTLS={home:"Главная",notifs:"Уведомления",warehouse:"Кабинет склада",props:"Реквизит",costumes:"Костюмы",cells:"Карта склада",kpp:"Разбор КПП",field:"Кабинет площадки",rental:"Аренда реквизита",transport:"Транспорт",locations:"Локации",pprops:"Реквизит партнёров",roles:"Роли и доступы"};

/* ── WAREHOUSE CABINET ───────────────────────────────────────────────────── */
const REQUESTS_INIT=[
  {id:"REQ-001",item:"PRO-00089",itemName:"Носилки складные",who:"Волков Д.",role:"Реквизитор",project:"НАШ СПЕЦНАЗ-4",scene:"46-1",date:"10.03.2025",status:"new"},
  {id:"REQ-002",item:"COS-00044",itemName:"Форма СОБР, комплект №1",who:"Петрова К.М.",role:"Костюмер",project:"НАШ СПЕЦНАЗ-4",scene:"46-1",date:"10.03.2025",status:"new"},
  {id:"REQ-003",item:"PRO-00211",itemName:"Флаг российский напольный",who:"Иванов А.С.",role:"Реквизитор",project:"НАШ СПЕЦНАЗ-4",scene:"46-9",date:"11.03.2025",status:"confirmed"},
  {id:"REQ-004",item:"PRO-00334",itemName:"Книги советские, 7 шт.",who:"Орлов П.",role:"Реквизитор",project:"НАШ СПЕЦНАЗ-4",scene:"46-4",date:"11.03.2025",status:"issued"},
];

/* ── PIN SCREEN ──────────────────────────────────────────────────────────── */
function PinScreen({ userId, userName, onSuccess }) {
  const [digits, setDigits] = useState([]);
  const [error, setError]   = useState(null);
  const [loading, setLoading] = useState(false);

  const press = async (d) => {
    if (loading) return;
    const next = [...digits, d];
    setDigits(next);
    setError(null);
    if (next.length === 4) {
      setLoading(true);
      try {
        const res = await fetch(`${API}/auth/pin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, pin: next.join("") }),
        });
        const data = await res.json();
        if (!res.ok) throw data;
        localStorage.setItem("access_token",  data.access);
        localStorage.setItem("refresh_token", data.refresh);
        localStorage.setItem("user", JSON.stringify(data.user));
        onSuccess(data.user);
      } catch {
        setError("Неверный PIN");
        setDigits([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const del = () => { setDigits(p => p.slice(0, -1)); setError(null); };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#1e3a8a,#7c3aed)", fontFamily: "'Inter',sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: "36px 32px", width: 300, textAlign: "center", boxShadow: "0 24px 80px rgba(0,0,0,.25)" }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg,#00AEEF,#0090C8)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <I n="user" s={28} c="#fff" />
        </div>
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>{userName || "Войти"}</div>
        <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 28 }}>Введите PIN-код</div>

        <div style={{ display: "flex", justifyContent: "center", gap: 14, marginBottom: 32 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: i < digits.length ? "#00AEEF" : "#e2e8f0", transition: "background .15s" }} />
          ))}
        </div>

        {error && <div style={{ background: "#fee2e2", color: "#dc2626", borderRadius: 8, padding: "8px 12px", fontSize: 13, fontWeight: 700, marginBottom: 16 }}>{error}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((k, i) => (
            <button key={i} onClick={() => k === "⌫" ? del() : k !== "" ? press(String(k)) : null}
              disabled={loading || k === ""}
              style={{ height: 56, borderRadius: 12, border: "1.5px solid #e2e8f0", background: k === "" ? "transparent" : "#f8fafc", fontSize: k === "⌫" ? 20 : 22, fontWeight: 700, color: "#1e293b", cursor: k === "" ? "default" : "pointer", transition: "background .1s" }}
            >{loading && digits.length === 4 && k !== "⌫" ? "" : k}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── SIGNATURE PAD ───────────────────────────────────────────────────────── */
function SignaturePad({ onSave, onClear: onClearExt }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [isEmpty, setIsEmpty] = useState(true);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - rect.left) * (canvas.width / rect.width), y: (src.clientY - rect.top) * (canvas.height / rect.height) };
  };

  const start = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
    drawing.current = true; setIsEmpty(false);
  }, []);

  const move = useCallback((e) => {
    if (!drawing.current) return; e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.stroke();
  }, []);

  const end = useCallback(() => { drawing.current = false; }, []);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true); onSave(null); onClearExt?.();
  }, [onSave, onClearExt]);

  const save = useCallback(() => {
    if (isEmpty) return;
    const data = canvasRef.current.toDataURL("image/png");
    onSave(data);
  }, [isEmpty, onSave]);

  useEffect(() => { save(); }, []);

  return (
    <div>
      <div style={{ border: "1.5px solid #cbd5e1", borderRadius: 10, background: "#f8fafc", overflow: "hidden", touchAction: "none" }}>
        <canvas ref={canvasRef} width={480} height={140} style={{ width: "100%", display: "block", cursor: "crosshair" }}
          onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
          onTouchStart={start} onTouchMove={move} onTouchEnd={end}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>Подпишите пальцем или мышью</span>
        <button className="btn bg sm" style={{ fontSize: 11 }} onClick={clear}><I n="trash" s={12} />Очистить</button>
      </div>
    </div>
  );
}

function IssueModal({req,onClose,onIssue}){
  const item=ITEMS.find(i=>i.id===req.item);
  const [step,setStep]=useState(1);
  const [cond,setCond]=useState("Отлично");
  const [sig,setSig]=useState(null);
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState(null);

  const doIssue=async()=>{
    if(!sig){setErr("Необходима подпись");return;}
    setLoading(true);setErr(null);
    try{
      await apiFetch(`/requests/${req.id}/issue`,{method:"POST",body:{condition_at_issue:cond,signature:sig}});
      onIssue(req.id);onClose();
    }catch(e){setErr(e?.error||"Ошибка");setLoading(false);}
  };

  return(<div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}><div className="modal">
    <div className="mtop"><div><div style={{fontSize:11,color:"#94a3b8",fontWeight:600,marginBottom:3}}>ВЫДАЧА РЕКВИЗИТА</div><div className="mtitle">{req.itemName}</div></div><button className="xbtn" onClick={onClose}><I n="x" s={15}/></button></div>
    <div className="mbody">
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        {["Проверить","Фото","Подпись"].map((s,i)=><div key={s} style={{flex:1,textAlign:"center",padding:"6px 0",borderRadius:7,background:step===i+1?"#00AEEF":step>i+1?"#dcfce7":"#f1f5f9",color:step===i+1?"#fff":step>i+1?"#16a34a":"#94a3b8",fontWeight:700,fontSize:12}}>{i+1}. {s}</div>)}
      </div>
      {step===1&&<>
        <div style={{background:"#f8fafc",borderRadius:10,border:"1px solid rgba(0,0,0,.07)",padding:"12px 14px",marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".8px",color:"#94a3b8",marginBottom:8}}>ПОЛУЧАТЕЛЬ</div>
          <div style={{fontWeight:800,fontSize:14}}>{req.who}</div>
          <div style={{fontSize:12,color:"#94a3b8",marginTop:2}}>{req.role} · {req.project} · Сцена {req.scene}</div>
        </div>
        {item&&<div style={{background:"rgba(124,58,237,.06)",borderRadius:10,border:"1px solid rgba(124,58,237,.2)",padding:"12px 14px",marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".8px",color:"#7c3aed",marginBottom:6}}>ЯЧЕЙКА</div>
          <Cell wh={item.wh} cell={item.cell}/>
        </div>}
        <div className="fg"><label className="fl">Состояние при выдаче</label>
          <select className="fi" value={cond} onChange={e=>setCond(e.target.value)}>
            {["Отлично","Хорошее","Удовлетворительное","Требует ремонта"].map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="mact"><button className="btn bp" onClick={()=>setStep(2)}>Далее — Фото</button><button className="btn bg" onClick={onClose}>Отмена</button></div>
      </>}
      {step===2&&<>
        <div style={{fontSize:10.5,fontWeight:700,textTransform:"uppercase",letterSpacing:".7px",color:"#94a3b8",marginBottom:8}}>СФОТОГРАФИРУЙТЕ ПРЕДМЕТ ПЕРЕД ВЫДАЧЕЙ</div>
        <PhotoUploader refType="item" refId={item?.id||0}/>
        <div style={{marginTop:12}} className="mact"><button className="btn bp" onClick={()=>setStep(3)}>Далее — Подпись</button><button className="btn bg" onClick={()=>setStep(1)}>Назад</button></div>
      </>}
      {step===3&&<>
        <div style={{fontSize:10.5,fontWeight:700,textTransform:"uppercase",letterSpacing:".7px",color:"#94a3b8",marginBottom:10}}>ПОДПИСЬ ПОЛУЧАТЕЛЯ — {req.who}</div>
        <SignaturePad onSave={setSig}/>
        {sig&&<div style={{background:"#dcfce7",borderRadius:8,padding:"8px 12px",marginTop:10,fontSize:12,color:"#16a34a",fontWeight:700}}>✓ Подпись получена</div>}
        {err&&<div style={{background:"#fee2e2",borderRadius:8,padding:"8px 12px",marginTop:8,fontSize:12,color:"#dc2626",fontWeight:700}}>{err}</div>}
        <div style={{background:"#f8fafc",borderRadius:8,padding:"10px 14px",marginTop:12,marginBottom:4}}>
          <div style={{fontSize:12,color:"#94a3b8",fontWeight:600}}>После выдачи:</div>
          <div style={{fontSize:13,marginTop:4}}>· Ячейка {item?.cell} освобождается автоматически</div>
          <div style={{fontSize:13}}>· Дедлайн возврата: {req.date}</div>
        </div>
        <div className="mact">
          <button className="btn bp" onClick={doIssue} disabled={!sig||loading}>
            {loading?<I n="clk" s={14} c="#fff"/>:<I n="ul" s={14} c="#fff"/>}{loading?"Сохраняем...":"Подтвердить выдачу"}
          </button>
          <button className="btn bg" onClick={()=>setStep(2)}>Назад</button>
        </div>
      </>}
    </div>
  </div></div>);
}

function ReturnModal({issue,onClose,onReturn}){
  const item=ITEMS.find(i=>i.id===issue.item);
  const [cond,setCond]=useState("Хорошее");
  const [damaged,setDamaged]=useState(false);
  const [sig,setSig]=useState(null);
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState(null);

  const doReturn=async()=>{
    if(!sig){setErr("Необходима подпись");return;}
    setLoading(true);setErr(null);
    try{
      await apiFetch(`/issuances/${issue.id}/return`,{method:"POST",body:{condition_at_return:cond,damaged,signature:sig}});
      onReturn(issue.id);onClose();
    }catch(e){setErr(e?.error||"Ошибка");setLoading(false);}
  };

  return(<div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}><div className="modal">
    <div className="mtop"><div><div style={{fontSize:11,color:"#94a3b8",fontWeight:600,marginBottom:3}}>ВОЗВРАТ РЕКВИЗИТА</div><div className="mtitle">{issue.itemName}</div></div><button className="xbtn" onClick={onClose}><I n="x" s={15}/></button></div>
    <div className="mbody">
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        <div style={{background:"#fef3c7",borderRadius:8,padding:"10px 12px"}}>
          <div style={{fontSize:10,fontWeight:700,color:"#d97706",textTransform:"uppercase",letterSpacing:".7px",marginBottom:4}}>ВЫДАН БЫЛ</div>
          <div style={{fontWeight:700,fontSize:13}}>{issue.who}</div>
          <div style={{fontSize:12,color:"#94a3b8"}}>{issue.date}</div>
        </div>
        {item&&<div style={{background:"rgba(124,58,237,.06)",borderRadius:8,padding:"10px 12px"}}>
          <div style={{fontSize:10,fontWeight:700,color:"#7c3aed",textTransform:"uppercase",letterSpacing:".7px",marginBottom:4}}>ВЕРНУТЬ В ЯЧЕЙКУ</div>
          <Cell wh={item.wh} cell={item.cell}/>
        </div>}
      </div>
      <div style={{fontSize:10.5,fontWeight:700,textTransform:"uppercase",letterSpacing:".7px",color:"#94a3b8",marginBottom:8}}>ФОТО ПРИ ВОЗВРАТЕ</div>
      <div style={{marginBottom:14}}><PhotoUploader refType="item" refId={item?.id||0}/></div>
      <div className="fg"><label className="fl">Состояние при возврате</label>
        <select className="fi" value={cond} onChange={e=>setCond(e.target.value)}>
          {["Отлично","Хорошее","Удовлетворительное","Повреждён"].map(c=><option key={c}>{c}</option>)}
        </select>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,padding:"10px 12px",background:damaged?"#fee2e2":"#f8fafc",borderRadius:8,cursor:"pointer",border:`1px solid ${damaged?"#dc2626":"rgba(0,0,0,.07)"}`}} onClick={()=>setDamaged(p=>!p)}>
        <div style={{width:18,height:18,borderRadius:4,border:`2px solid ${damaged?"#dc2626":"#cbd5e1"}`,background:damaged?"#dc2626":"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
          {damaged&&<I n="chk" s={12} c="#fff"/>}
        </div>
        <span style={{fontSize:13,fontWeight:700,color:damaged?"#dc2626":"#334155"}}>Обнаружены повреждения — создать задачу на ремонт</span>
      </div>
      <div style={{fontSize:10.5,fontWeight:700,textTransform:"uppercase",letterSpacing:".7px",color:"#94a3b8",marginBottom:8}}>ПОДПИСЬ СДАЮЩЕГО — {issue.who}</div>
      <SignaturePad onSave={setSig}/>
      {sig&&<div style={{background:"#dcfce7",borderRadius:8,padding:"8px 12px",marginTop:8,fontSize:12,color:"#16a34a",fontWeight:700}}>✓ Подпись получена</div>}
      {err&&<div style={{background:"#fee2e2",borderRadius:8,padding:"8px 12px",marginTop:8,fontSize:12,color:"#dc2626",fontWeight:700}}>{err}</div>}
      <div className="mact" style={{marginTop:14}}>
        <button className="btn bp" onClick={doReturn} disabled={!sig||loading}>
          {loading?<I n="clk" s={14} c="#fff"/>:<I n="dl" s={14} c="#fff"/>}{loading?"Сохраняем...":"Принять возврат"}
        </button>
        <button className="btn bg" onClick={onClose}>Отмена</button>
      </div>
    </div>
  </div></div>);
}

function WarehouseView(){
  const [requests,setRequests]=useState(REQUESTS_INIT);
  const [issued,setIssued]=useState(ITEMS.filter(i=>i.status==="Выдан").map(i=>({id:i.id,item:i.id,itemName:i.name,who:i.issuedTo,date:i.returnDate,status:"issued"})));
  const [issueModal,setIssueModal]=useState(null);
  const [returnModal,setReturnModal]=useState(null);
  const [tab,setTab]=useState("requests");

  useEffect(()=>{
    apiFetch("/requests").then(rows=>{
      setRequests(rows.map(r=>({
        id:r.id,item:r.item_id,itemName:r.item_name||r.item_name_free||"—",
        who:r.requested_by_name||"—",role:r.requested_by_role||"",
        project:r.project||"",scene:r.scene||"",date:r.needed_by||"",status:r.status
      })));
    }).catch(()=>{});
    apiFetch("/issuances").then(rows=>{
      setIssued(rows.map(r=>({
        id:r.id,item:r.item_id,itemName:r.item_name||"—",
        who:r.issued_to_name||"—",date:r.return_date||"",status:"issued"
      })));
    }).catch(()=>{});
  },[]);

  const newReqs=requests.filter(r=>r.status==="new");
  const confirmReqs=requests.filter(r=>r.status==="confirmed");
  const doIssue=id=>setRequests(p=>p.map(r=>r.id===id?{...r,status:"issued"}:r));
  const doReturn=id=>setIssued(p=>p.filter(r=>r.id!==id));
  const confirm=async(id)=>{
    setRequests(p=>p.map(r=>r.id===id?{...r,status:"confirmed"}:r));
    apiFetch(`/requests/${id}`,{method:"PATCH",body:{status:"confirmed"}}).catch(()=>{
      setRequests(p=>p.map(r=>r.id===id?{...r,status:"new"}:r));
    });
  };
  return(<div>
    <div className="wh-stats">
      {[{c:"#dc2626",bg:"#fee2e2",n:newReqs.length,l:"Новых запросов"},{c:"#d97706",bg:"#fef3c7",n:confirmReqs.length,l:"Ожидают выдачи"},{c:"#16a34a",bg:"#dcfce7",n:issued.length,l:"На руках"},{c:"#00AEEF",bg:"#E6F7FD",n:ITEMS.filter(i=>i.status==="На складе").length,l:"На складе"}].map(s=>(<div key={s.l} style={{background:s.bg,borderRadius:12,padding:"12px 14px",border:`1px solid ${s.c}33`}}>
        <div style={{fontSize:26,fontWeight:800,color:s.c,letterSpacing:"-1px",lineHeight:1}}>{s.n}</div>
        <div style={{fontSize:11.5,color:s.c,fontWeight:700,marginTop:3,opacity:.8}}>{s.l}</div>
      </div>))}
    </div>
    <div style={{display:"flex",borderBottom:"1px solid rgba(0,0,0,.07)",marginBottom:14}}>
      {[["requests","Запросы с площадки",newReqs.length],["issued","Выдано — ожидаем возврат",issued.length]].map(([id,lbl,cnt])=>(
        <button key={id} className={`stab ${tab===id?"on":""}`} style={{fontFamily:"'Inter',sans-serif"}} onClick={()=>setTab(id)}>{lbl}{cnt>0&&<span style={{marginLeft:6,background:tab===id?"rgba(255,255,255,.3)":"#fee2e2",color:tab===id?"#fff":"#dc2626",fontSize:10,fontWeight:800,padding:"1px 6px",borderRadius:20}}>{cnt}</span>}</button>
      ))}
    </div>
    {tab==="requests"&&<div>
      {requests.filter(r=>r.status!=="issued").length===0&&<div style={{textAlign:"center",padding:"40px",color:"#94a3b8",fontWeight:600}}>Нет активных запросов</div>}
      {requests.filter(r=>r.status!=="issued").map(r=>(
        <div key={r.id} className="req-row" style={{background:"#fff",borderRadius:12,border:"1px solid rgba(0,0,0,.08)",padding:"14px 16px",marginBottom:8,display:"flex",alignItems:"center",gap:12,boxShadow:"0 1px 3px rgba(0,0,0,.06)"}}>
          <div style={{width:38,height:38,borderRadius:10,background:r.status==="new"?"#fee2e2":"#fef3c7",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <I n="box" s={18} c={r.status==="new"?"#dc2626":"#d97706"}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontWeight:800,fontSize:13.5}}>{r.itemName}</div>
            <div style={{fontSize:12,color:"#94a3b8",marginTop:2}}>{r.who} · {r.role} · Сцена {r.scene} · {r.date}</div>
          </div>
          <Pill s={r.status==="new"?"Нет":r.status==="confirmed"?"Зарезервирован":"Выдан"}/>
          {r.status==="new"&&<button className="btn bg sm" onClick={()=>confirm(r.id)}>Подтвердить</button>}
          {r.status==="confirmed"&&<button className="btn bp sm" onClick={()=>setIssueModal(r)}><I n="ul" s={13} c="#fff"/>Выдать</button>}
        </div>
      ))}
    </div>}
    {tab==="issued"&&<div>
      {issued.length===0&&<div style={{textAlign:"center",padding:"40px",color:"#94a3b8",fontWeight:600}}>Всё возвращено</div>}
      {issued.map(r=>(
        <div key={r.id} className="req-row" style={{background:"#fff",borderRadius:12,border:"1px solid rgba(0,0,0,.08)",padding:"14px 16px",marginBottom:8,display:"flex",alignItems:"center",gap:12,boxShadow:"0 1px 3px rgba(0,0,0,.06)"}}>
          <div style={{width:38,height:38,borderRadius:10,background:"#fef3c7",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><I n="ul" s={18} c="#d97706"/></div>
          <div style={{flex:1}}>
            <div style={{fontWeight:800,fontSize:13.5}}>{r.itemName}</div>
            <div style={{fontSize:12,color:"#94a3b8",marginTop:2}}>У: {r.who} · Вернуть до: <span style={{color:"#dc2626",fontWeight:700}}>{r.date}</span></div>
          </div>
          <button className="btn bg sm" onClick={()=>setReturnModal(r)}><I n="dl" s={13}/>Принять возврат</button>
        </div>
      ))}
    </div>}
    {issueModal&&<IssueModal req={issueModal} onClose={()=>setIssueModal(null)} onIssue={doIssue}/>}
    {returnModal&&<ReturnModal issue={returnModal} onClose={()=>setReturnModal(null)} onReturn={doReturn}/>}
  </div>);
}

/* ── FIELD CABINET ───────────────────────────────────────────────────────── */
function ConfirmReceiptModal({issuance, onClose, onConfirmed}){
  const [sig,setSig]=useState(null);
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState(null);
  const doConfirm=async()=>{
    if(!sig){setErr("Необходима подпись");return;}
    setLoading(true);setErr(null);
    try{
      await apiFetch(`/field/issuances/${issuance.id}/confirm`,{method:"POST",body:{signature:sig}});
      onConfirmed(issuance.id);onClose();
    }catch(e){setErr(e?.error||"Ошибка");setLoading(false);}
  };
  return(<div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}><div className="modal">
    <div className="mtop"><div><div style={{fontSize:11,color:"#94a3b8",fontWeight:600,marginBottom:3}}>ПОДТВЕРЖДЕНИЕ ПОЛУЧЕНИЯ</div><div className="mtitle">{issuance.item_name||issuance.name}</div></div><button className="xbtn" onClick={onClose}><I n="x" s={15}/></button></div>
    <div className="mbody">
      <div style={{background:"#fef3c7",borderRadius:10,border:"1px solid #d97706",padding:"12px 14px",marginBottom:14,fontSize:13,color:"#92400e",fontWeight:600}}>
        Подпишите, что получили предмет в надлежащем состоянии. Подпись сохраняется в системе.
      </div>
      <div style={{fontSize:10.5,fontWeight:700,textTransform:"uppercase",letterSpacing:".7px",color:"#94a3b8",marginBottom:8}}>ВАША ПОДПИСЬ</div>
      <SignaturePad onSave={setSig}/>
      {sig&&<div style={{background:"#dcfce7",borderRadius:8,padding:"8px 12px",marginTop:8,fontSize:12,color:"#16a34a",fontWeight:700}}>✓ Подпись получена</div>}
      {err&&<div style={{background:"#fee2e2",borderRadius:8,padding:"8px 12px",marginTop:8,fontSize:12,color:"#dc2626",fontWeight:700}}>{err}</div>}
      <div className="mact" style={{marginTop:14}}>
        <button className="btn bp" onClick={doConfirm} disabled={!sig||loading}>
          {loading?<I n="clk" s={14} c="#fff"/>:<I n="chk" s={14} c="#fff"/>}{loading?"Сохраняем...":"Подтвердить получение"}
        </button>
        <button className="btn bg" onClick={onClose}>Отмена</button>
      </div>
    </div>
  </div></div>);
}

function FieldView({user}){
  const [myItems,setMyItems]=useState([
    {id:1,item_name:"Ваза напольная белая, керамика h=60см",return_date:"01.03.2025",receipt_confirmed_at:"2025-01-01"},
    {id:2,item_name:"Форма СОБР, комплект №2",return_date:"01.03.2025",receipt_confirmed_at:null},
  ]);
  const [requests,setRequests]=useState([
    {id:1,item_name_free:"Носилки складные",scene:"46-1",needed_by:"10.03.2025",status:"new"},
    {id:2,item_name_free:"Флаг российский напольный",scene:"46-9",needed_by:"11.03.2025",status:"confirmed"},
  ]);
  const [showReq,setShowReq]=useState(false);
  const [confirmModal,setConfirmModal]=useState(null);
  const [newReq,setNewReq]=useState({name:"",scene:"",date:""});
  const [loading,setLoading]=useState(false);

  useEffect(()=>{
    apiFetch("/field/issuances").then(rows=>setMyItems(rows)).catch(()=>{});
    apiFetch("/field/requests").then(rows=>setRequests(rows)).catch(()=>{});
  },[]);

  const statusLabel=s=>({new:"Ожидает",confirmed:"Зарезервирован",rejected:"Отклонён",issued:"Выдан"}[s]||s);
  const statusPill=s=>({new:"Частично",confirmed:"Зарезервирован",rejected:"Нет",issued:"На складе"}[s]||"Частично");

  const onConfirmed=id=>setMyItems(p=>p.map(i=>i.id===id?{...i,receipt_confirmed_at:new Date().toISOString()}:i));

  const addReq=async()=>{
    if(!newReq.name.trim())return;
    setLoading(true);
    try{
      const r=await apiFetch("/field/requests",{method:"POST",body:{item_name_free:newReq.name,scene:newReq.scene,needed_by:newReq.date}});
      setRequests(p=>[r,...p]);setNewReq({name:"",scene:"",date:""});setShowReq(false);
    }catch{
      setRequests(p=>[{id:Date.now(),item_name_free:newReq.name,scene:newReq.scene,needed_by:newReq.date,status:"new"},...p]);
      setNewReq({name:"",scene:"",date:""});setShowReq(false);
    }finally{setLoading(false);}
  };

  return(<div>
    <div style={{background:"linear-gradient(135deg,#1e3a8a,#7c3aed)",borderRadius:14,padding:"16px 20px",marginBottom:14,display:"flex",alignItems:"center",gap:14}}>
      <div style={{width:44,height:44,borderRadius:12,background:"rgba(255,255,255,.2)",display:"flex",alignItems:"center",justifyContent:"center"}}><I n="user" s={22} c="#fff"/></div>
      <div><div style={{fontWeight:800,fontSize:16,color:"#fff"}}>{user?.name||"—"}</div><div style={{fontSize:13,color:"rgba(255,255,255,.7)",marginTop:2}}>{user?.role||""}</div></div>
      <div style={{marginLeft:"auto",background:"rgba(255,255,255,.15)",borderRadius:8,padding:"6px 12px"}}><div style={{fontSize:11,color:"rgba(255,255,255,.7)",fontWeight:600}}>На руках</div><div style={{fontSize:20,fontWeight:800,color:"#fff"}}>{myItems.length}</div></div>
    </div>
    <div className="field-g" style={{display:"grid",gap:12,marginBottom:14}}>
      <div className="card" style={{padding:"14px 16px"}}>
        <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".7px",color:"#94a3b8",marginBottom:10}}>МОЙ РЕКВИЗИТ</div>
        {myItems.length===0&&<div style={{fontSize:12,color:"#94a3b8",textAlign:"center",padding:"20px 0"}}>Ничего на руках</div>}
        {myItems.map(i=>(<div key={i.id} style={{padding:"10px 0",borderBottom:"1px solid rgba(0,0,0,.05)"}}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:4}}>{i.item_name}</div>
          <div className="field-item-row" style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:11.5,color:"#dc2626",fontWeight:700}}>Вернуть до {i.return_date}</span>
            {!i.receipt_confirmed_at
              ?<button className="btn bp sm" style={{fontSize:11}} onClick={()=>setConfirmModal(i)}><I n="chk" s={12} c="#fff"/>Подтвердить получение</button>
              :<span style={{fontSize:11.5,color:"#16a34a",fontWeight:700}}>✓ Получено</span>
            }
          </div>
        </div>))}
      </div>
      <div className="card" style={{padding:"14px 16px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".7px",color:"#94a3b8"}}>МОИ ЗАПРОСЫ</div>
          <button className="btn bp sm" style={{fontSize:11}} onClick={()=>setShowReq(true)}><I n="plus" s={12} c="#fff"/>Новый</button>
        </div>
        {requests.length===0&&<div style={{fontSize:12,color:"#94a3b8",textAlign:"center",padding:"20px 0"}}>Нет запросов</div>}
        {requests.map(r=>(<div key={r.id} style={{padding:"8px 0",borderBottom:"1px solid rgba(0,0,0,.05)"}}>
          <div style={{fontWeight:700,fontSize:13}}>{r.item_name||r.item_name_free}</div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:4}}>
            <span style={{fontSize:11,color:"#94a3b8"}}>Сцена {r.scene} · {r.needed_by}</span>
            <Pill s={statusPill(r.status)}/>
          </div>
        </div>))}
      </div>
    </div>
    {showReq&&<div className="ov" onClick={e=>e.target===e.currentTarget&&setShowReq(false)}><div className="modal">
      <div className="mtop"><div><div style={{fontSize:11,color:"#94a3b8",fontWeight:600,marginBottom:3}}>НОВЫЙ ЗАПРОС</div><div className="mtitle">Запросить реквизит</div></div><button className="xbtn" onClick={()=>setShowReq(false)}><I n="x" s={15}/></button></div>
      <div className="mbody">
        <div className="fg"><label className="fl">Что нужно</label><input className="fi" placeholder="Название предмета..." value={newReq.name} onChange={e=>setNewReq(p=>({...p,name:e.target.value}))}/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div className="fg"><label className="fl">Сцена</label><input className="fi" placeholder="46-1" value={newReq.scene} onChange={e=>setNewReq(p=>({...p,scene:e.target.value}))}/></div>
          <div className="fg"><label className="fl">Нужно к</label><input className="fi" type="date" value={newReq.date} onChange={e=>setNewReq(p=>({...p,date:e.target.value}))}/></div>
        </div>
        <div className="mact"><button className="btn bp" onClick={addReq} disabled={loading}><I n="send" s={14} c="#fff"/>{loading?"Отправляем...":"Отправить запрос"}</button><button className="btn bg" onClick={()=>setShowReq(false)}>Отмена</button></div>
      </div>
    </div></div>}
    {confirmModal&&<ConfirmReceiptModal issuance={confirmModal} onClose={()=>setConfirmModal(null)} onConfirmed={onConfirmed}/>}
  </div>);
}

/* ── CELLS MAP ───────────────────────────────────────────────────────────── */
const CELLS_DATA=[
  {code:"A-01",status:"free",section:"A"},{code:"A-02",status:"free",section:"A"},{code:"A-03",status:"free",section:"A"},
  {code:"A-04",status:"occupied",item:"PRO-00089",itemName:"Носилки складные",section:"A"},{code:"A-05",status:"free",section:"A"},{code:"A-06",status:"free",section:"A"},
  {code:"B-01",status:"occupied",item:"PRO-00147",itemName:"Ваза напольная белая",section:"B"},{code:"B-02",status:"free",section:"B"},{code:"B-03",status:"occupied",item:"PRO-00203",itemName:"Фрагменты СВУ",section:"B"},
  {code:"B-04",status:"free",section:"B"},{code:"B-05",status:"free",section:"B"},{code:"B-06",status:"blocked",section:"B"},
  {code:"C-01",status:"free",section:"C"},{code:"C-02",status:"occupied",item:"PRO-00211",itemName:"Флаг российский",section:"C"},{code:"C-03",status:"free",section:"C"},
  {code:"C-04",status:"occupied",item:"PRO-00334",itemName:"Книги советские",section:"C"},{code:"C-05",status:"free",section:"C"},{code:"C-06",status:"free",section:"C"},
  {code:"D-01",status:"free",section:"D"},{code:"D-02",status:"free",section:"D"},{code:"D-03",status:"occupied",item:"PRO-00156",itemName:"Рация Motorola",section:"D"},
  {code:"D-04",status:"free",section:"D"},{code:"D-05",status:"free",section:"D"},{code:"D-06",status:"free",section:"D"},
  {code:"K-01",status:"occupied",item:"COS-00044",itemName:"Форма СОБР №1",section:"K"},{code:"K-02",status:"occupied",item:"COS-00045",itemName:"Форма СОБР №2",section:"K"},{code:"K-03",status:"free",section:"K"},
  {code:"K-04",status:"occupied",item:"COS-00112",itemName:"Форма ППС",section:"K"},{code:"K-05",status:"free",section:"K"},{code:"K-06",status:"occupied",item:"COS-00204",itemName:"Спецодежда фельдшера",section:"K"},
];

function CellsView(){
  const [selCell,setSelCell]=useState(null);
  const [search,setSearch]=useState("");
  const sections=["A","B","C","D","K"];
  const filtered=search?CELLS_DATA.filter(c=>c.itemName?.toLowerCase().includes(search.toLowerCase())||c.code.toLowerCase().includes(search.toLowerCase())):CELLS_DATA;
  const stats={free:CELLS_DATA.filter(c=>c.status==="free").length,occ:CELLS_DATA.filter(c=>c.status==="occupied").length,blk:CELLS_DATA.filter(c=>c.status==="blocked").length};
  const cellColor=c=>{if(search&&(c.itemName?.toLowerCase().includes(search.toLowerCase())||c.code.toLowerCase().includes(search.toLowerCase())))return{bg:"#fef3c7",border:"#d97706",txt:"#92400e"};if(c.status==="free")return{bg:"#dcfce7",border:"#16a34a",txt:"#065f46"};if(c.status==="occupied")return{bg:"#E6F7FD",border:"#00AEEF",txt:"#0090C8"};return{bg:"#f1f5f9",border:"#94a3b8",txt:"#64748b"};};
  return(<div>
    <div style={{display:"flex",gap:10,marginBottom:14,alignItems:"center"}}>
      <div style={{display:"flex",gap:8}}>
        {[{c:"#16a34a",bg:"#dcfce7",n:stats.free,l:"Свободно"},{c:"#00AEEF",bg:"#E6F7FD",n:stats.occ,l:"Занято"},{c:"#94a3b8",bg:"#f1f5f9",n:stats.blk,l:"Заблокировано"}].map(s=>(<div key={s.l} style={{background:s.bg,borderRadius:10,padding:"8px 14px",border:`1px solid ${s.c}44`}}>
          <span style={{fontWeight:800,fontSize:20,color:s.c}}>{s.n}</span>
          <span style={{fontSize:11.5,color:s.c,fontWeight:600,marginLeft:6}}>{s.l}</span>
        </div>))}
      </div>
      <div className="sw" style={{marginLeft:"auto"}}>
        <span className="sico"><I n="search" s={14}/></span>
        <input className="si" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Поиск по ячейке или предмету..."/>
      </div>
    </div>
    {sections.map(sec=>{
      const cells=CELLS_DATA.filter(c=>c.section===sec);
      return(<div key={sec} style={{background:"#fff",borderRadius:14,border:"1px solid rgba(0,0,0,.08)",padding:"14px 16px",marginBottom:10,boxShadow:"0 1px 3px rgba(0,0,0,.06)"}}>
        <div style={{fontSize:11,fontWeight:800,textTransform:"uppercase",letterSpacing:"1px",color:"#94a3b8",marginBottom:10}}>
          СЕКЦИЯ {sec} {sec==="K"?"— Склад Костюмов":"— Склад А/Б"}
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {cells.map(c=>{
            const col=cellColor(c);
            return(<div key={c.code} onClick={()=>setSelCell(c===selCell?null:c)} style={{width:80,height:64,borderRadius:8,border:`2px solid ${col.border}`,background:col.bg,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,transition:"transform .1s",transform:selCell?.code===c.code?"scale(1.08)":"scale(1)"}}>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:800,color:col.txt}}>{c.code}</span>
              {c.status==="occupied"&&<span style={{fontSize:9,color:col.txt,fontWeight:600,textAlign:"center",lineHeight:1.2,padding:"0 4px"}}>{c.itemName?.split(" ").slice(0,2).join(" ")}</span>}
              {c.status==="free"&&<span style={{fontSize:9,color:col.txt,fontWeight:600}}>свободна</span>}
              {c.status==="blocked"&&<span style={{fontSize:9,color:col.txt,fontWeight:600}}>заблок.</span>}
            </div>);
          })}
        </div>
        {selCell&&selCell.section===sec&&<div style={{marginTop:12,padding:"12px 14px",background:"#f8fafc",borderRadius:8,border:"1px solid rgba(0,0,0,.07)"}}>
          <div style={{fontWeight:800,fontSize:14,marginBottom:4}}>Ячейка {selCell.code}</div>
          {selCell.status==="occupied"?<><div style={{fontSize:13,color:"#334155"}}>{selCell.itemName}</div><div style={{fontSize:11.5,fontFamily:"'JetBrains Mono',monospace",color:"#94a3b8",marginTop:2}}>{selCell.item}</div><div style={{display:"flex",gap:6,marginTop:8}}><button className="btn bp sm">Открыть карточку</button><button className="btn br sm">Освободить ячейку</button></div></>:<div style={{color:"#16a34a",fontWeight:700,fontSize:13}}>Ячейка свободна</div>}
        </div>}
      </div>);
    })}
  </div>);
}

/* ── RENTAL VIEW ─────────────────────────────────────────────────────────── */
const RENTALS_INIT=[
  {id:"RNT-0001",renter:"Кинокомпания Мосфильм",type:"Компания",items:[{name:"Ваза напольная белая",price:800},{name:"Книги советские",price:300}],start:"01.03.2025",end:"07.03.2025",days:6,total:6600,status:"Активна",payment:"Оплачено"},
  {id:"RNT-0002",renter:"Иванченко П.С.",type:"Физлицо",items:[{name:"Флаг российский напольный",price:500}],start:"05.03.2025",end:"10.03.2025",days:5,total:2500,status:"Активна",payment:"Не оплачено"},
  {id:"RNT-0003",renter:"Студия СТАР-Медиа",type:"Компания",items:[{name:"Форма СОБР, комплект №1",price:2500},{name:"Форма СОБР, комплект №2",price:2500},{name:"Форма ППС, комплект",price:1800}],start:"15.02.2025",end:"20.02.2025",days:5,total:34000,status:"Завершена",payment:"Оплачено"},
];

function RentalModal({rental,onClose,onSigned}){
  const [sigMode,setSigMode]=useState(false);
  const [sig,setSig]=useState(null);
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState(null);
  const isSigned=rental.status==="signed"||rental.signed_at;

  const openPrint=()=>{
    const id=rental.id||rental._id;
    window.open(`${API}/contracts/${id}/print`,"_blank");
  };

  const doSign=async()=>{
    if(!sig){setErr("Необходима подпись");return;}
    setLoading(true);setErr(null);
    try{
      const updated=await apiFetch(`/contracts/${rental.id}/sign`,{method:"POST",body:{signature:sig}});
      onSigned?.(updated);onClose();
    }catch(e){setErr(e?.error||"Ошибка");setLoading(false);}
  };

  const meta=rental.meta_json||{};
  const items=meta.items||rental.items||[];
  const days=rental.days||(rental.start_date&&rental.end_date?Math.max(1,Math.ceil((new Date(rental.end_date)-new Date(rental.start_date))/86400000)):1);

  return(<div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}><div className="modal">
    <div className="mtop">
      <div>
        <div style={{fontSize:11,color:"#94a3b8",fontWeight:600,marginBottom:3}}>ДОГОВОР АРЕНДЫ</div>
        <div className="mtitle">{meta.renter_name||rental.renter||rental.project}</div>
        <div className="mid">{rental.id}</div>
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        {isSigned&&<span style={{background:"#dcfce7",color:"#16a34a",fontSize:11,fontWeight:800,padding:"3px 10px",borderRadius:20}}>✓ Подписан</span>}
        <button className="xbtn" onClick={onClose}><I n="x" s={15}/></button>
      </div>
    </div>
    <div className="mbody">
      {!sigMode&&<>
        <div className="mgrid">
          {[["Арендатор",meta.renter_name||rental.renter||rental.project],["Тип",meta.renter_type||rental.type||"—"],["Начало",rental.start||rental.start_date],["Конец",rental.end||rental.end_date],["Дней",days],["Статус",rental.status||"draft"]].map(([l,v])=><div key={l}><div className="mfl">{l}</div><div className="mfv">{v||"—"}</div></div>)}
        </div>
        <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".7px",color:"#94a3b8",marginBottom:8}}>СОСТАВ АРЕНДЫ</div>
        <div style={{background:"#f8fafc",borderRadius:10,border:"1px solid rgba(0,0,0,.07)",overflow:"hidden",marginBottom:14}}>
          {items.map((it,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"10px 14px",borderBottom:i<items.length-1?"1px solid rgba(0,0,0,.05)":"none"}}>
            <span style={{fontWeight:600,fontSize:13}}>{it.name||it.item}</span>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"#00AEEF",fontWeight:700}}>{(it.price||0).toLocaleString()} руб/сут</span>
          </div>))}
          <div style={{display:"flex",justifyContent:"space-between",padding:"12px 14px",background:"#f1f5f9",borderTop:"2px solid rgba(0,0,0,.07)"}}>
            <span style={{fontWeight:800,fontSize:14}}>Итого за {days} дней</span>
            <span style={{fontWeight:800,fontSize:16,color:"#00AEEF"}}>{(rental.total||rental.total_price||0).toLocaleString()} руб</span>
          </div>
        </div>
        <div className="mact">
          <button className="btn bp sm" onClick={openPrint}><I n="doc" s={13} c="#fff"/>Печать / PDF</button>
          {!isSigned&&<button className="btn bg sm" style={{background:"#7c3aed",color:"#fff",border:"none"}} onClick={()=>setSigMode(true)}><I n="edit" s={13} c="#fff"/>Подписать</button>}
          <button className="btn bg sm"><I n="edit" s={13}/>Редактировать</button>
        </div>
      </>}
      {sigMode&&<>
        <div style={{background:"#f0f9ff",borderRadius:10,border:"1px solid #bae6fd",padding:"12px 14px",marginBottom:14,fontSize:13,color:"#0369a1",fontWeight:600}}>
          Подпись арендатора будет встроена в договор и сохранена в системе.
        </div>
        <div style={{fontSize:10.5,fontWeight:700,textTransform:"uppercase",letterSpacing:".7px",color:"#94a3b8",marginBottom:8}}>ПОДПИСЬ АРЕНДАТОРА — {meta.renter_name||rental.renter}</div>
        <SignaturePad onSave={setSig}/>
        {sig&&<div style={{background:"#dcfce7",borderRadius:8,padding:"8px 12px",marginTop:8,fontSize:12,color:"#16a34a",fontWeight:700}}>✓ Подпись получена</div>}
        {err&&<div style={{background:"#fee2e2",borderRadius:8,padding:"8px 12px",marginTop:8,fontSize:12,color:"#dc2626",fontWeight:700}}>{err}</div>}
        <div className="mact" style={{marginTop:14}}>
          <button className="btn bp" onClick={doSign} disabled={!sig||loading}>
            {loading?<I n="clk" s={14} c="#fff"/>:<I n="chk" s={14} c="#fff"/>}{loading?"Сохраняем...":"Сохранить подпись"}
          </button>
          <button className="btn bg" onClick={()=>{setSigMode(false);setErr(null);}}>Назад</button>
        </div>
      </>}
    </div>
  </div></div>);
}

function RentalView(){
  const [rentals,setRentals]=useState(RENTALS_INIT);
  const [sel,setSel]=useState(null);
  const [showNew,setShowNew]=useState(false);
  const [nf,setNf]=useState({renter:"",type:"Компания",item:"",price:"",start:"",end:""});
  const [loading,setLoading]=useState(false);

  const totalActive=rentals.filter(r=>r.status==="Активна"||r.status==="active"||r.status==="signed").reduce((s,r)=>s+(r.total||r.total_price||0),0);
  const calcDays=(s,e)=>{try{const a=s.includes(".")?s.split(".").reverse().join("-"):s;const b=e.includes(".")?e.split(".").reverse().join("-"):e;const d=(new Date(b)-new Date(a))/86400000;return d>0?Math.ceil(d):1;}catch{return 1;}};

  const statusLabel=s=>({draft:"Черновик",signed:"Подписан",active:"Активна",completed:"Завершена","Активна":"Активна","Завершена":"Завершена"}[s]||s);
  const statusPill=s=>({draft:"Частично",signed:"Зарезервирован",active:"Выдан",completed:"Постоянный","Активна":"Выдан","Завершена":"Постоянный"}[s]||"Частично");

  const addRental=async()=>{
    if(!nf.renter||!nf.item)return;
    const days=calcDays(nf.start||"2025-03-01",nf.end||"2025-03-07");
    const price=parseInt(nf.price)||500;
    const total=days*price;
    setLoading(true);
    try{
      const r=await apiFetch("/contracts",{method:"POST",body:{
        renter_name:nf.renter,renter_type:nf.type,
        start_date:nf.start,end_date:nf.end,total_price:total,
        items:[{name:nf.item,price}]
      }});
      setRentals(p=>[r,...p]);
    }catch{
      setRentals(p=>[{id:`RNT-${Date.now()}`,renter:nf.renter,type:nf.type,items:[{name:nf.item,price}],start:nf.start,end:nf.end,days,total,status:"draft",payment:"Не оплачено"},...p]);
    }finally{setLoading(false);}
    setNf({renter:"",type:"Компания",item:"",price:"",start:"",end:""});setShowNew(false);
  };

  const onSigned=updated=>setRentals(p=>p.map(r=>r.id===updated.id?{...r,...updated}:r));

  const getRenter=r=>{const m=r.meta_json||{};return m.renter_name||r.renter||r.project||"—";}
  const getType=r=>{const m=r.meta_json||{};return m.renter_type||r.type||"—";}
  const getItems=r=>{const m=r.meta_json||{};return(m.items||r.items||[]).map(i=>i.name||i.item).join(", ")||"—";}
  const getTotal=r=>r.total||r.total_price||0;

  return(<div>
    <div style={{display:"flex",gap:12,marginBottom:14,alignItems:"stretch"}}>
      {[{c:"#16a34a",bg:"#dcfce7",n:rentals.filter(r=>["Активна","active","signed"].includes(r.status)).length,l:"Активных аренд"},{c:"#00AEEF",bg:"#E6F7FD",n:`${totalActive.toLocaleString()} руб`,l:"В обороте"},{c:"#7c3aed",bg:"#ede9fe",n:rentals.filter(r=>r.status==="signed").length,l:"Подписано"}].map(s=>(<div key={s.l} style={{flex:1,background:s.bg,borderRadius:12,padding:"12px 14px",border:`1px solid ${s.c}33`}}>
        <div style={{fontSize:22,fontWeight:800,color:s.c,letterSpacing:"-.5px",lineHeight:1}}>{s.n}</div>
        <div style={{fontSize:11.5,color:s.c,fontWeight:700,marginTop:3,opacity:.8}}>{s.l}</div>
      </div>))}
      <button className="btn bp" style={{alignSelf:"center",marginLeft:"auto"}} onClick={()=>setShowNew(true)}><I n="plus" s={14} c="#fff"/>Новая аренда</button>
    </div>
    <div className="card">
      <div className="ch"><span className="ct">Все договора аренды</span><span className="cs">нажмите строку для деталей</span></div>
      <table className="tbl">
        <thead><tr><th>ID</th><th>Арендатор</th><th>Предметы</th><th>Период</th><th>Сумма</th><th>Статус</th></tr></thead>
        <tbody>{rentals.map(r=>(<tr key={r.id} onClick={()=>setSel(r)} style={{cursor:"pointer"}}>
          <td><span className="idc">{r.id}</span></td>
          <td><div style={{fontWeight:700}}>{getRenter(r)}</div><div style={{fontSize:11,color:"#94a3b8"}}>{getType(r)}</div></td>
          <td style={{color:"#334155",fontSize:12.5,maxWidth:180}}>{getItems(r)}</td>
          <td style={{fontSize:12,fontFamily:"'JetBrains Mono',monospace"}}>{r.start||r.start_date} — {r.end||r.end_date}<br/><span style={{color:"#94a3b8"}}>{r.days} дн.</span></td>
          <td style={{fontWeight:800,color:"#00AEEF",fontFamily:"'JetBrains Mono',monospace"}}>{getTotal(r).toLocaleString()} руб</td>
          <td>
            {r.status==="signed"&&<span style={{background:"#dcfce7",color:"#16a34a",fontSize:11,fontWeight:800,padding:"2px 8px",borderRadius:20}}>✓ Подписан</span>}
            {r.status!=="signed"&&<Pill s={statusPill(r.status)}/>}
          </td>
        </tr>))}</tbody>
      </table>
    </div>
    {sel&&<RentalModal rental={sel} onClose={()=>setSel(null)} onSigned={onSigned}/>}
    {showNew&&<div className="ov" onClick={e=>e.target===e.currentTarget&&setShowNew(false)}><div className="modal">
      <div className="mtop"><div><div style={{fontSize:11,color:"#94a3b8",fontWeight:600,marginBottom:3}}>НОВАЯ АРЕНДА</div><div className="mtitle">Оформить договор</div></div><button className="xbtn" onClick={()=>setShowNew(false)}><I n="x" s={15}/></button></div>
      <div className="mbody">
        <div className="frow">
          <div className="fg"><label className="fl">Арендатор</label><input className="fi" placeholder="Кинокомпания / ФИО" value={nf.renter} onChange={e=>setNf(p=>({...p,renter:e.target.value}))}/></div>
          <div className="fg"><label className="fl">Тип</label><select className="fi" value={nf.type} onChange={e=>setNf(p=>({...p,type:e.target.value}))}><option>Компания</option><option>Физлицо</option><option>Фотостудия</option><option>Другое</option></select></div>
        </div>
        <div className="fg"><label className="fl">Предмет аренды</label><input className="fi" placeholder="Ваза напольная белая..." value={nf.item} onChange={e=>setNf(p=>({...p,item:e.target.value}))}/></div>
        <div className="frow">
          <div className="fg"><label className="fl">Цена за сутки (руб)</label><input className="fi" type="number" placeholder="800" value={nf.price} onChange={e=>setNf(p=>({...p,price:e.target.value}))}/></div>
          <div className="fg"><label className="fl">Дата начала</label><input className="fi" type="date" value={nf.start} onChange={e=>setNf(p=>({...p,start:e.target.value}))}/></div>
        </div>
        <div className="fg"><label className="fl">Дата возврата</label><input className="fi" type="date" value={nf.end} onChange={e=>setNf(p=>({...p,end:e.target.value}))}/></div>
        {nf.price&&nf.start&&nf.end&&<div style={{background:"#E6F7FD",borderRadius:8,padding:"10px 14px",marginBottom:12,fontWeight:700,color:"#0090C8",fontSize:14}}>
          Итого: {(calcDays(nf.start,nf.end)*(parseInt(nf.price)||0)).toLocaleString()} руб за {calcDays(nf.start,nf.end)} дней
        </div>}
        <div className="mact"><button className="btn bp" onClick={addRental} disabled={loading}><I n="save" s={14} c="#fff"/>{loading?"Создаём...":"Создать договор"}</button><button className="btn bg" onClick={()=>setShowNew(false)}>Отмена</button></div>
      </div>
    </div></div>}
  </div>);
}

const BOT_NAV=[
  {id:"home",ico:"home",lbl:"Главная"},
  {id:"warehouse",ico:"arch",lbl:"Склад"},
  {id:"field",ico:"users",lbl:"Кабинет"},
  {id:"kpp",ico:"film",lbl:"КПП"},
  {id:"notifs",ico:"bell",lbl:"Уведомления"},
];

function LoginScreen({onLogin}){
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState(null);
  const doLogin=async(e)=>{
    e.preventDefault();
    if(!email||!pass)return;
    setLoading(true);setErr(null);
    try{
      const d=await apiFetch("/auth/login",{method:"POST",body:{email,password:pass}},false);
      localStorage.setItem("access_token",d.access);
      localStorage.setItem("refresh_token",d.refresh);
      onLogin(d.user);
    }catch(e){setErr(e?.error||"Ошибка входа");setLoading(false);}
  };
  return(<><style>{CSS}</style>
  <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"var(--surface)"}}>
    <div style={{background:"#fff",borderRadius:18,padding:"36px 32px",width:"100%",maxWidth:380,boxShadow:"var(--sh2)"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:28}}>
        <div className="sb-mark"><ClapIcon s={20}/></div>
        <div><div style={{fontWeight:800,fontSize:16,color:"var(--ink)"}}>3X Media Cloud</div><div style={{fontSize:11.5,color:"var(--ink3)",fontWeight:600}}>Production Assets</div></div>
      </div>
      <form onSubmit={doLogin}>
        <div className="fg" style={{marginBottom:12}}><label className="fl">Email</label>
          <input className="fi" type="email" placeholder="user@example.com" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)}/>
        </div>
        <div className="fg" style={{marginBottom:20}}><label className="fl">Пароль</label>
          <input className="fi" type="password" placeholder="••••••••" autoComplete="current-password" value={pass} onChange={e=>setPass(e.target.value)}/>
        </div>
        {err&&<div style={{background:"#fee2e2",borderRadius:8,padding:"8px 12px",marginBottom:14,fontSize:12,color:"#dc2626",fontWeight:700}}>{err}</div>}
        <button type="submit" className="btn bp" style={{width:"100%",justifyContent:"center"}} disabled={loading}>
          {loading?"Входим...":"Войти"}
        </button>
      </form>
    </div>
  </div></>);
}

export default function App(){
  const [user,setUser]=useState(null);
  const [authChecked,setAuthChecked]=useState(false);
  const [view,setView]=useState("home");
  const [mOpen,setMOpen]=useState(false);

  useEffect(()=>{
    const token=localStorage.getItem("access_token");
    if(!token){setAuthChecked(true);return;}
    apiFetch("/auth/me",{},false).then(u=>{setUser(u);setAuthChecked(true);}).catch(()=>{
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setAuthChecked(true);
    });
  },[]);

  useEffect(()=>{
    const handler=()=>{setUser(null);};
    window.addEventListener("auth:logout",handler);
    return()=>window.removeEventListener("auth:logout",handler);
  },[]);

  const logout=()=>{
    const rt=localStorage.getItem("refresh_token");
    if(rt)apiFetch("/auth/logout",{method:"POST",body:{token:rt}},false).catch(()=>{});
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  };

  if(!authChecked)return(<><style>{CSS}</style><div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"var(--surface)"}}><div style={{color:"var(--ink3)",fontWeight:600,fontSize:14}}>Загрузка...</div></div></>);
  if(!user)return <LoginScreen onLogin={setUser}/>;

  const nav=(v)=>{setView(v);setMOpen(false);};
  const initials=user.name?user.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase():"??";
  return(<><style>{CSS}</style>
  {mOpen&&<div className="sb-overlay" onClick={()=>setMOpen(false)}/>}
  <div className="app">
    <div className={`sb ${mOpen?"open":""}`}>
      <div className="sb-top"><div className="sb-mark"><ClapIcon s={20}/></div><div><div className="sb-name">3X Media cloud</div><div className="sb-sub">Production Assets</div></div><button className="xbtn" style={{marginLeft:"auto",flexShrink:0}} onClick={()=>setMOpen(false)}><I n="x" s={14}/></button></div>
      <div className="nav">{NAV.map((item,i)=>item.s?(<div key={i} className="ns" style={{marginTop:i>0?4:0}}>{item.s}</div>):(<div key={item.id} className={`ni ${view===item.id?"on":""}`} onClick={()=>nav(item.id)}><span className="nico"><I n={item.ico} s={15} c={view===item.id?"#fff":"#334155"}/></span>{item.lbl}{item.badge>0&&<span className="bdg">{item.badge}</span>}</div>))}</div>
      <div className="sb-bot" style={{cursor:"pointer"}} onClick={logout}><div className="ava">{initials}</div><div><div className="avn">{user.name}</div><div className="avr">{user.role}</div></div></div>
    </div>
    <div className="main">
      <div className="topbar">
        <button className="hamburger" onClick={()=>setMOpen(true)}><I n="layers" s={18}/></button>
        <div className="tbt">{TTLS[view]}</div>
        {view==="kpp"&&<span className="tbp">08-09.02.2025 · Блок 3</span>}
        <div style={{flex:1}}/>
        <span style={{fontSize:12.5,fontWeight:600,color:"#94a3b8",display:"none"}} className="tb-project">НАШ СПЕЦНАЗ-4</span>
        <div className="sep"/>
        <button className="btn bg sm" onClick={logout} style={{fontSize:11}}><I n="x" s={12}/>Выйти</button>
      </div>
      <div className="content">
        {view==="home"&&<HomeView/>}
        {view==="notifs"&&<NotifsView/>}
        {view==="warehouse"&&<WarehouseView user={user}/>}
        {view==="props"&&<InvView type="p"/>}
        {view==="costumes"&&<InvView type="c"/>}
        {view==="cells"&&<CellsView/>}
        {view==="kpp"&&<KPPView/>}
        {view==="field"&&<FieldView user={user}/>}
        {view==="rental"&&<RentalView/>}
        {view==="transport"&&<TransportView/>}
        {view==="locations"&&<LocationsView/>}
        {view==="pprops"&&<PartnerView/>}
        {view==="roles"&&<RolesView/>}
      </div>
      <div className="bnav">
        {BOT_NAV.map(b=>(
          <button key={b.id} className={`bni${view===b.id?" on":""}`} onClick={()=>nav(b.id)}>
            <div className="bni-ico"><I n={b.ico} s={22} c={view===b.id?"#00AEEF":"#8898AA"}/></div>
            {b.lbl}
          </button>
        ))}
      </div>
    </div>
  </div></>);
}
