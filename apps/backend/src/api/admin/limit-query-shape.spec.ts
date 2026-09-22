import { buildSchema, parse, validate } from 'graphql';
import { limitQueryShape } from './limit-query-shape';

const schema = buildSchema(`
  type User { id: ID! friend: User }
  type Query { users: [User!]! }
`);

const rule = limitQueryShape({ maxRootFields: 3, maxDepth: 4, maxTotalFields: 50 });

function errorsFor(query: string): string[] {
  return validate(schema, parse(query), [rule]).map((error) => error.message);
}

describe('limitQueryShape', () => {
  it('cho qua một truy vấn bình thường', () => {
    expect(errorsFor('{ users { id } }')).toEqual([]);
  });

  it('chặn khi nhân bản root field bằng alias, thứ throttler không thấy', () => {
    const errors = errorsFor('{ a: users { id } b: users { id } c: users { id } d: users { id } }');

    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('3');
  });

  it('chặn khi lồng quá sâu', () => {
    const errors = errorsFor('{ users { friend { friend { friend { id } } } } }');

    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('4');
  });

  it('không đụng tới truy vấn introspection, để Sandbox còn dùng được', () => {
    const introspection = `{ __schema { types { name fields { name type { name ofType { name } } } } } }`;

    expect(errorsFor(introspection)).toEqual([]);
  });

  it('đếm cả độ sâu nằm trong fragment, thứ dễ dùng để lách', () => {
    const errors = errorsFor(`
      { users { ...A } }
      fragment A on User { friend { ...B } }
      fragment B on User { friend { friend { friend { id } } } }
    `);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('4');
  });

  it('không tính định nghĩa fragment thành root field', () => {
    const errors = errorsFor(`
      { users { ...A } }
      fragment A on User { id }
      fragment B on User { id }
      fragment C on User { id }
      fragment D on User { id }
    `);

    expect(errors).toEqual([]);
  });

  it('không treo khi fragment tham chiếu vòng', () => {
    const errors = errorsFor(`
      { users { ...A } }
      fragment A on User { friend { ...B } }
      fragment B on User { friend { ...A } }
    `);

    expect(Array.isArray(errors)).toBe(true);
  });

  it('không bung fragment theo cấp số nhân, thứ biến chính nó thành vũ khí DoS', () => {
    let document = '{ users { ...F10 } }\nfragment F0 on User { id }\n';
    for (let level = 1; level <= 10; level += 1) {
      document += `fragment F${level} on User { ${`...F${level - 1} `.repeat(5)} }\n`;
    }

    const started = Date.now();
    const errors = errorsFor(document);

    expect(Date.now() - started).toBeLessThan(1000);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('đếm root field theo từng operation, không cộng dồn cả document', () => {
    const twoOperations = `
      query First { a: users { id } b: users { id } }
      query Second { c: users { id } d: users { id } }
    `;

    expect(errorsFor(twoOperations)).toEqual([]);
  });
});
