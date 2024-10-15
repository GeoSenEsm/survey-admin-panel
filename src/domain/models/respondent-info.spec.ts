import { convertToValueDisplayMappings, RespondentInfoCollections, RespondentInfoValueDisplayMappings } from "./respondent-info";

describe('convertToValueDisplayMappings', () => {
    it('should convert RespondentInfoCollections to RespondentInfoValueDisplayMappings correctly', () => {
      const collections: RespondentInfoCollections = {
        group1: [
          { id: '1', display: 'Alice' },
          { id: '2', display: 'Bob' },
        ],
        group2: [
          { id: '3', display: 'Charlie' },
          { id: '4', display: 'David' },
        ]
      };
  
      const expectedMappings: RespondentInfoValueDisplayMappings = {
        group1: new Map([
          ['1', 'Alice'],
          ['2', 'Bob'],
        ]),
        group2: new Map([
          ['3', 'Charlie'],
          ['4', 'David'],
        ])
      };
  
      const result = convertToValueDisplayMappings(collections);
  
      expect(result).toEqual(expectedMappings);
    });
  
    it('should return an empty object when given an empty RespondentInfoCollections', () => {
      const collections: RespondentInfoCollections = {};
  
      const expectedMappings: RespondentInfoValueDisplayMappings = {};
  
      const result = convertToValueDisplayMappings(collections);
  
      expect(result).toEqual(expectedMappings);
    });
  });