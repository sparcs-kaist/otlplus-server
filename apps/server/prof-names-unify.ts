import { PrismaClient } from '@prisma/client';
import settings from './src/settings';
import { setTimeout } from 'timers/promises';
import * as deepl from 'deepl-node';
import { ConnectionError } from 'deepl-node';

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
    //  console.log('No API key specified... terminate.');
    throw new Error('No API key specified.');
  } else if (!name) {
    //  console.log('Name is null... terminate.')
    throw new Error('Name is null.');
  }
  const translator = new deepl.Translator(apiKey);
  try {
    return translator.translateText(name, 'en', 'ko');
  } catch (e) {
    if (e instanceof ConnectionError) {
      await setTimeout(1000);
      return translator.translateText(name, 'en', 'ko');
    }
  }
}

// 0. Insert datas into paper_professor, paper from otl-lab-tf database

// 1. Translate romanized names into Korean names
async function translateNames() {
  const paperProfs = await prisma.paper_professor.findMany({});
  for (const paperProf of paperProfs) {
    if (!paperProf.professor_name || paperProf.professor_name == 'null') {
      const name_en = paperProf.professor_name_en;
      const name = (await convertToKorean(name_en))?.text;
      //  console.log(`[id=${paperProf.id}] ${name_en} is translated to ${name}`);
      // Update professor_name for translated name.
      await prisma.paper_professor.update({
        where: {
          id: paperProf.id,
        },
        data: {
          professor_name: name,
        },
      });
      await setTimeout(1000);
    } else {
      //  console.log(`[id=${paperProf.id}] Translation is skipped as its name is ${paperProf.professor_name}`);
    }
  }
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
      //  console.log(`[id=${paperProf.id}] Matching...`);
      const data = await prisma.subject_department.findFirst({
        select: {
          id: true,
        },
        where: {
          name: paperProf.department!,
          visible: true,
        },
      });
      if (!data) {
        throw new Error(`[id=${paperProf.id}] Could not found corresponding department for ${paperProf.department}`);
      }
      const major = data.id;
      //  console.log(`[id=${paperProf.id}] Major code for ${paperProf.department} is ${major}`);
      const matchedProfs = await prisma.subject_professor.findMany({
        where: { professor_name: paperProf.professor_name!, major: String(major) },
      });
      //  console.log(`[id=${paperProf.id}] ${matchedProfs.length} records are found.`)
      // Link only when there are matched professors.
      if (matchedProfs.length > 0) {
        await prisma.paper_prof_to_subject_prof.createMany({
          data: matchedProfs.map((subjectProf) => ({
            paper_professor_id: paperProf.id,
            subject_professor_id: subjectProf.id,
          })),
        });
      }
      //  console.log(`[id=${paperProf.id}] Matching done.`)
    }),
  );
}

// 3. Link papers with corresponding professor.
async function linkPapers() {
  const papers = await prisma.paper.findMany({});
  for (const paper of papers) {
    //  console.log(`[id=${paper.id}] Matching...`);
    // Find corresponding professor
    const professor = await prisma.paper_professor.findFirst({
      where: {
        professor_name_en: paper.professor_name,
      },
    });
    // Update if professor is found
    if (professor) {
      await prisma.paper.update({
        where: {
          id: paper.id,
        },
        data: {
          professor_id: professor.id,
        },
      });
      //  console.log(`[id=${paper.id}] Matching done.`)
    } else {
      //  console.log(`[id=${paper.id}] Matching failed.`)
    }
  }
}

async function migrate() {
  try {
    //  console.log('Initialize...')
    await translateNames();
    //  console.log('Successfully translated names.');
    await linkProfessors();
    //  console.log('Successfully linked professors.');
    await linkPapers();
    //  console.log('Successfully linked papers.');
  } catch (e) {
    //  console.log('Error: ', e);
  }
}

migrate();
