import { describe, expect, it } from 'vitest';
import { glossary } from '../../data/load-glossary';
import { findAbbreviations } from '../../model/find-abbreviations';

const found = (text: string) =>
  findAbbreviations(text, glossary).map((match) => [match.index, match.text, match.entry.id]);

describe('findAbbreviations with the real glossary', () => {
  it('finds every whole-word abbreviation with its position and entry', () => {
    expect(found('Una cola de SQS cifrada con KMS.')).toEqual([
      [12, 'SQS', 'sqs'],
      [28, 'KMS', 'kms'],
    ]);
  });

  it('matches abbreviations with digits and mixed case', () => {
    expect(found('Amazon EC2 guarda en S3 y resiste un ataque DDoS')).toEqual([
      [7, 'EC2', 'ec2'],
      [21, 'S3', 's3'],
      [44, 'DDoS', 'ddos'],
    ]);
  });

  it('ignores lowercase text and abbreviations glued to other letters or digits', () => {
    expect(found('sqs, SQSX, XSQS, S30, SASL/SCRAM')).toEqual([]);
  });

  it('accepts punctuation around the abbreviation', () => {
    expect(found('(VPC), «IAM», EBS.')).toEqual([
      [1, 'VPC', 'vpc'],
      [8, 'IAM', 'iam'],
      [14, 'EBS', 'ebs'],
    ]);
  });

  it('only takes RAM as AWS RAM, never as computer memory', () => {
    expect(found('la memoria (RAM) y la RAM')).toEqual([]);
    expect(found('Comparte con AWS RAM.')).toEqual([[17, 'RAM', 'ram']]);
  });

  it('returns nothing for text without abbreviations', () => {
    expect(found('Contenido pendiente.')).toEqual([]);
  });
});
