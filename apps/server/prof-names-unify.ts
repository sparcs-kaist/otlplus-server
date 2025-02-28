import { PrismaClient } from "@prisma/client";
import settings from './src/settings';

import * as deepl from 'deepl-node';

class PrismaClientMock extends PrismaClient {
  constructor() {
    const ormOption = settings().ormconfig();
    super(ormOption);
  }
}

const prisma = new PrismaClientMock();

// Translate using DeepL translate API.
async function convertToKorean(name: string | null) {
  const apiKey = settings().getDeeplConfig().apiKey;
  if (!apiKey) {
    console.log('No API key specified... terminate.');
    throw new Error('No API key specified.');
  } else if (!name) {
    console.log('Name is null... terminate.')
    throw new Error('Name is null.');
  }
  const translator = new deepl.Translator(apiKey);
  return translator.translateText(name, 'en', 'ko');
}

// 0. Insert datas into paper_professor, paper from otl-lab-tf database

// 1. Translate romanized names into Korean names
async function translateNames() {
  const paperProfs = await prisma.paper_professor.findMany({});
  await Promise.all(
    paperProfs.map(async (paperProf) => {
      if (!paperProf.professor_name || paperProf.professor_name == 'null') {
        const name_en = paperProf.professor_name_en;
        const name = (await convertToKorean(name_en)).text;
        console.log(`[id=${paperProf.id}] ${name_en} is translated to ${name}`);
        // Update professor_name for translated name.
        prisma.paper_professor.update({
          where: {
            id: paperProf.id,
          },
          data: {
            professor_name: name,
          }
        });
      } else {
        console.log(`[id=${paperProf.id}] Translation is skipped as its name is ${paperProf.professor_name}`);
      }
    })
  );
}

// 2. Create paper_prof_to_subject_prof
async function linkProfessors() {
  // Fetch every record from paper_prof
  const paperProfs = await prisma.paper_professor.findMany({});
  // Iterate for each professor, match every professor from subject_professor that satisfies following:
  // convertToKorean(paper_prof.name) == subject_professor.professor_name
  // That is, who have same Korean name with the professor from paper_professor.
  await Promise.all(
    paperProfs.map(async (paperProf) => {
      // We can assume that professor_name is not null after translation is done.
      const matchedProfs = await prisma.subject_professor.findMany({
        where: { professor_name: paperProf.professor_name! },
      });
      // Link only when there are matched professors.
      if (matchedProfs.length > 0) {
        return prisma.paper_prof_to_subject_prof.createMany({
          data: matchedProfs.map((subjectProf) => ({
            paper_professor_id: paperProf.id,
            subject_professor_id: subjectProf.id,
          })),
        });
      }
    })
  );
}

// 3. Link papers with corresponding professor.
async function linkPapers() {
  const paperProfs = await prisma.paper_professor.findMany({});
  await Promise.all(
    paperProfs.map(async (paperProf) => {
      return prisma.paper.updateMany({
        where: { professor_name: (await convertToKorean(paperProf.professor_name)).text },
        data: { professor_id: paperProf.id },
      });
    })
  );
}

async function migrate() {
  try {
    console.log('Initialize...')
    await translateNames()
    console.log('Successfully translated names.');
    await linkProfessors();
    console.log('Successfully linked professors.');
    await linkPapers();
    console.log('Successfully linked papers.');
  } catch (e) {
    console.log('Error: ', e);
  }
}

migrate();