import { getTimezoneOffset, calculateDistanceOfTrace, calculateDuration,
         createPoint, calculateElevation, calculateHighAlt, calculateLowAlt,
         processPointsInGPXFile, calculateBoundingBox} from "../pages/map/UploadModel.js";
import haversine from "haversine";

const DATE = null;

it("test processPointsInGPXFile", () => {
  const p1 = createPoint(51.417864, 5.445850, 0, DATE);
  const p2 = createPoint(51.411864, 5.441850, 0, DATE);
  const p3 = createPoint(51.414371, 5.438404, 0, DATE);

  let onePoint = [p1];
  let onePointProcessed = processPointsInGPXFile(onePoint);
  expect(onePointProcessed).toStrictEqual([]);
  let twoPoints = [p1, p2];
  let twoPointsProcessed = processPointsInGPXFile(twoPoints);
  expect(twoPointsProcessed.detail).toStrictEqual([
    {lat: 51417864, lng: 5445850},
    {lat: 51411864, lng: 5441850}
  ]);
  expect(twoPointsProcessed.medium).toStrictEqual([
    {lat: 51417864, lng: 5445850},
    {lat: 51411864, lng: 5441850}
  ]);
  expect(twoPointsProcessed.coarse).toStrictEqual([
    {lat: 51417864, lng: 5445850},
    {lat: 51411864, lng: 5441850}
  ]);
  let threePoints = [p1, p2, p3];
  let threePointsProcessed = processPointsInGPXFile(threePoints);
  expect(threePointsProcessed.detail).toStrictEqual([
    {lat: 51417864, lng: 5445850},
    {lat: 51411864, lng: 5441850},
    {lat: 51414371, lng: 5438404},
  ]);
  expect(threePointsProcessed.medium).toStrictEqual([
    {lat: 51417864, lng: 5445850},
    {lat: 51411864, lng: 5441850},
    {lat: 51414371, lng: 5438404},
  ]);
  expect(threePointsProcessed.coarse).toStrictEqual([
    {lat: 51417864, lng: 5445850},
    {lat: 51414371, lng: 5438404}
  ]);
});

it("test timezone offset", () => {
  let summerDate = new Date('2019-09-15T10:20:30Z');
  [[51.417864, 5.445850, 2], // Eindhoven
   [31.236472, 121.462355, 8], // Shanghai
   [37.776549, -122.450695, -7], // San Francisco
   [32.035438, 34.762802, 3], // Tel Aviv
   [-33.918150, 151.212044, 10], // Sydney
  ].forEach((e) => {
    expect(getTimezoneOffset(e[0], e[1], summerDate)).toBe(e[2] * 60);
  });

  let winterDate = new Date('2019-01-15T10:20:30Z');
  [[51.417864, 5.445850, 1], // Eindhoven
   [31.236472, 121.462355, 8], // Shanghai
   [37.776549, -122.450695, -8], // San Francisco
   [32.035438, 34.762802, 2], // Tel Aviv
   [-33.918150, 151.212044, 11], // Sydney
  ].forEach((e) => {
    expect(getTimezoneOffset(e[0], e[1], winterDate)).toBe(e[2] * 60);
  });
});

it("test calculateDistanceOfTrace", () => {
  const p1 = {
    latitude: 30.849635,
    longitude: -83.24559
  };
  const p2 = {
    latitude: 27.950575,
    longitude: -82.457178
  };
  const p3 = {
    latitude: 27.950175,
    longitude: -82.452178
  };

  let onePoints = [createPoint(p1.latitude, p1.longitude, 0, new Date())];
  expect(calculateDistanceOfTrace(onePoints)).toBe(0);
  
  let twoPoints = [createPoint(p1.latitude, p1.longitude, 0, new Date()),
                   createPoint(p2.latitude, p2.longitude, 0, new Date())
                  ];
  expect(calculateDistanceOfTrace(twoPoints)).toBe(haversine(p1, p2, {unit: 'meter'}));

  let threePoints = [createPoint(p1.latitude, p1.longitude, 0, new Date()),
                     createPoint(p2.latitude, p2.longitude, 0, new Date()),
                     createPoint(p3.latitude, p3.longitude, 0, new Date())
                    ];
  expect(calculateDistanceOfTrace(threePoints)).toBe(haversine(p1, p2, {unit: 'meter'}) + haversine(p3, p2, {unit: 'meter'}));
});

it("test duration", () => {
  const d1 = new Date('2019-09-15T10:20:00Z');
  const d2 = new Date('2019-09-15T10:21:00Z');
  const d3 = new Date('2019-09-15T10:21:30Z');

  let onePoint = [createPoint(0, 0, 0, d1)];
  expect(calculateDuration(onePoint)).toBe(0);
  let twoPoints = [createPoint(0, 0, 0, d1), createPoint(0, 0, 0, d2)];
  expect(calculateDuration(twoPoints)).toBe(60);
  let threePoints = [createPoint(0, 0, 0, d1), createPoint(0, 0, 0, d2), createPoint(0, 0, 0, d3)];
  expect(calculateDuration(threePoints)).toBe(90);
});

it("test altitude elevation", () => {
  const p1 = createPoint(0, 0, 10.1, DATE);
  const p2 = createPoint(0, 0, 11.1, DATE);
  const p3 = createPoint(0, 0, 9.1, DATE);

  let onePoint = [p1];
  expect(calculateElevation(onePoint)).toBe(0);
  let twoPoints = [p1, p2];
  expect(calculateElevation(twoPoints)).toBe(1 * 0.95);
  let threePoints = [p1, p2, p3];
  expect(calculateElevation(threePoints)).toBe(1 * 0.95);
});

it("test min altitude", () => {
  const p1 = createPoint(0, 0, 10.1, DATE);
  const p2 = createPoint(0, 0, 11.1, DATE);
  const p3 = createPoint(0, 0, 9.1, DATE);

  let onePoint = [p1];
  expect(calculateLowAlt(onePoint)).toBe(10.1);
  let twoPoints = [p1, p2];
  expect(calculateLowAlt(twoPoints)).toBe(10.1);
  let threePoints = [p1, p2, p3];
  expect(calculateLowAlt(threePoints)).toBe(9.1);
});

it("test calculate bounding box", () => {
  const p1 = createPoint(51.443348, 5.479333, 0, DATE); // Eindhoven
  const p2 = createPoint(48.857218, 2.341885, 0, DATE); // Paris
  const p3 = createPoint(37.803254, -122.417321, 0, DATE); // San Francisco
  const p4 = createPoint(-23.591268, -46.614789, 0, DATE); // São Paulo
  const p5 = createPoint(-33.855866, 151.216202, 0, DATE); // Sydney
  
  let onePoint = [p1];
  expect(calculateBoundingBox(onePoint)).toEqual({
    maxLat: 51.443348, minLat: 51.443348, maxLng: 5.479333, minLng: 5.479333
  });
  
  let p1p2 = [p1, p2];
  expect(calculateBoundingBox(p1p2)).toEqual({
    maxLat: 51.443348, minLat: 48.857218, maxLng: 5.479333, minLng: 2.341885
  });

  let p15 = [p1, p2, p3, p4, p5];
  expect(calculateBoundingBox(p15)).toEqual({
    maxLat: 51.443348, minLat: -33.855866, maxLng: 151.216202, minLng: -122.417321
  });
  
});
