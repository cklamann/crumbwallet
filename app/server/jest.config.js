module.exports = {
	moduleFileExtensions: ["js", "ts"],
	roots: ['./tests'],
	testEnvironment: 'node',
	preset: '@shelf/jest-mongodb',
	transform: {
		'^.+\\.tsx?$': 'ts-jest',
	},
};
