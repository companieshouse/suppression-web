module.exports = {
    testPathIgnorePatterns: [
        "/node_modules/",
        "/dist/"
    ],
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest"
    }
}