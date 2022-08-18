// eslint-disable-next-line
require("dotenv").config()
import express from "express"
import { Directory, File, FileVersion } from "@prisma/client"
import { graphqlHTTP } from "express-graphql"
import { createApplication, createModule, gql } from "graphql-modules"
import { fileModule } from "./file"
import { directoryModule } from "./directory"
import { fileVersionModule } from "./fileVersion"

const mainModule = createModule({
  id: "main-module",
  dirname: __dirname,
  typeDefs: [
    gql`
      interface FileNode {
        id: ID!
        name: String!
        createdAt: String!
        updatedAt: String!
      }

      type Query {
        searchFiles(query: String!): [FileNode]
      }
    `,
  ],
  resolvers: {
    FileNode: {
      __resolveType(obj: File | FileVersion | Directory) {
        if (Object.prototype.hasOwnProperty.call(obj, "parentId")) {
          return "Directory"
        }
        if (Object.prototype.hasOwnProperty.call(obj, "fileId")) {
          return "FileVersion"
        }
        if (Object.prototype.hasOwnProperty.call(obj, "directoryId")) {
          return "File"
        }
      },
    },
    Query: {
      searchFiles: () => {
        return []
      },
    },
  },
})

const api = createApplication({
  modules: [mainModule, directoryModule, fileModule, fileVersionModule],
})

const app = express()


app.use(
  "/graphql",
  graphqlHTTP({
    schema: api.schema,
    customExecuteFn: api.createExecution(),
    graphiql: process.env.NODE_ENV === "development",
  })
)

app.listen(process.env.LOCAL_PORT ?? 4000, () => {
  console.log(`Application running on port ${process.env.LOCAL_PORT ?? 4000}.`)
})
