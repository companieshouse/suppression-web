module.exports = {
    roots: [
        "<rootDir>"
    ],
    testPathIgnorePatterns: [
        "/node_modules/",
        "/dist/"
    ],
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest"
    },
}