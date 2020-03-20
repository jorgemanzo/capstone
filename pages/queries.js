import gql from 'graphql-tag'
//
// Getting userID or  searching by email, and creating a user
export const getUserId = gql`
    query GetUserId($email: String!){
      Users(where: {email: {_eq: $email}}) {
        Id
      }
    }
`
export const searchUserByEmail = gql`
query SearchUserByEmail($email: String!) {
  Users(where: {email: {_ilike: $email}}, limit: 5) {
    Id
    email
  }
}
`
export const addUser = gql`
    mutation AddUser($email: String!) {
      insert_Users(objects: {email: $email}) {
        returning {
          Id
          email
        }
      }
    }
`

//
// Papers
//
export const getSegmentsForPapersByUserId = gql`
query getSegmentsForPapersByUserId($userId: Int!) {
  Segment(where: {userId: {_eq: $userId}}) {
    currentVersion
    name
    id
    status
    history(order_by: {version: asc}) {
      content
      segmentId
      id
      version
    }
  }
}
`
export const addPaper = gql`
mutation AddPaper($userId: Int!, $name: String!) {
  insert_Paper(objects: {userId: $userId, name: $name}){
   returning {
     name
     Id
     currentVersion
   }
  }
}
`
export const addPaperVersion = gql`
mutation AddPaperVersion($paperId: Int!, $version: Int!) {
  insert_PaperVersion(objects: {paperId: $paperId, version: $version}) {
    returning {
      Id
      version
    }
  }
}
`




export const addSegmentToPaper = gql`
mutation AddSegmentToPaper($paperId: Int!, $order: Int!, $segmentId: Int!) {
  insert_PaperSegment(objects: {paperId: $paperId, order: $order, atVersion: 1, segmentId: $segmentId}) {
    returning {
      Id
      atVersion
      order
    }
  }
}
`
export const getPaperSegments = gql`
query getPaperSegments($paperId: Int!){
  PaperSegment(order_by: {order: asc}, where: {paperId: {_eq: $paperId}}) {
    Segment{
      id
      name
      currentVersion
      history{
        content
      }
    }
  }
}
`



export const getUserPapers = gql`
    query getUserPapersQuery($email: String!) {
      Paper(where: {User: {email: {_eq: $email}}}) {
        name
        Id
        currentVersion
        segments {
          order
          Segment {
            id
            name
            history {
              content
              SegmentFeedbacks {
                User {
                  email
                }
                Id
                sentenceFeedback
              }
            }
          }
        }
      }
    }
`

//
// Circles
//
export const createCircleAdmin = gql`
mutation CreateCircleAdmin($email: String!) {
  insert_Circles(objects: {Admin: {data: {email: $email}}}) {
    returning {
      Id
    }
  }
}
`
export const getCircleMembershipForUser = gql`
query getCircleMembershipForUserQuery($email: String!) {
  CircleMembers(where: {MemberUser: {email: {_eq: $email}}}) {
    Circle {
      Id
      Admin {
        email
      }
      CircleMembers {
        MemberUser {
          email
        }
      }
    }
  }
}
`
//
// Segment Feedback
//
export const addFeedbackToSegmentBySegmentIdAndVersionAndUserId = gql`
mutation addFeedbackToSegmentBySegmentIdAndVersionAndUserId($segmentId: Int!, $content: String!, $versionId: Int!, $userId: Int!) {
  affectedSegmentFeedback: insert_SegmentFeedback(objects: {segmentVersionID: $versionId, sentenceFeedback: $content, userId: $userId}) {
    affected_rows
  }
  affectedSegment: update_Segment(where: {id: {_eq: $segmentId}}, _set: {status: 2}) {
    affected_rows
  }
}
`

//
// Segments
//
export const addSegment = gql`
mutation AddSegment($segmentName: String!, $id: Int!, $content: String!, $subjectCode: Int) {
  insert_Segment(objects: {name: $segmentName, history: {data: {content: $content}}, userId: $id, Subject: $subjectCode}) {
    returning {
      name
      status
      currentVersion
      id
      history {
        content
        version
      }
      SubjectCode {
        Subject
      }
    }
  }
}
`
export const getUserSegments = gql`
query getUserSegmentsQuery($id: Int!) {
  active:Segment(where: {userId: {_eq: $id}, status: {_eq: 1}}) {
    status
    name
    id
    currentVersion
  }
  inactive:Segment(where: {userId: {_eq: $id}, status: {_eq: 0}}) {
    status
    name
    id
    currentVersion
  }
}
`
export const getUserSegmentsAll = gql`
query getUserSegmentsAllQuery($email: String!) {
  Segment(where: {User: {email: {_eq: $email}}}) {
    name
    id
    currentVersion
  }
}
`

export const setSegmentStatus = gql`
mutation setSegmentStatus($segmentId: Int!, $newStatus: Int) {
  update_Segment(where: {id: {_eq: $segmentId}}, _set: {status: $newStatus}) {
    returning {
      id
      name
      status
      currentVersion
    }
  }
}
`
export const getCurrentVersionBySegmentId = gql`
query getCurrentVersionBySegmentId($segmentId: Int!) {
  Segment(where: {id: {_eq: $segmentId}}) {
    currentVersion,
      name
  }
}
`
export const getSegmentVersionsAndFeedbackByIdAndVersion = gql`
query getSegmentVersionsAndFeedbackByIdAndVersion($segmentId: Int!, $version: Int!) {
  versions:SegmentVersion(where: {segmentId: {_eq: $segmentId}}, order_by: {version: asc}) {
    text:content
    id
    version
  }
  feedback:SegmentFeedback(where: {SegmentVersion: {segmentId: {_eq: $segmentId}, version: {_eq: $version}}}) {
    Id
    text:sentenceFeedback
    User {
      email
    }
  }
}
`

export const setSegmentVersionById = gql`
mutation setSegmentVersionById($segmentId: Int!, $newVersionValue: Int!) {
  update_Segment(where: {id: {_eq: $segmentId}}, _set: {currentVersion: $newVersionValue}) {
    affected_rows
  }
}
`

export const setSegmentTitleById = gql`
mutation setSegmentTitleById($segmentId: Int!, $title: String!) {
  update_Segment(where: {id: {_eq: $segmentId}}, _set: {name: $title}) {
    returning {
      name
    }
  }
}
`

export const setSegmentVersionContentBySegmentIdAndVersion = gql`
mutation setSegmentVersionContentBySegmentIdAndVersion($segmentId: Int!, $version: Int!, $content: String!) {
  update_SegmentVersion(where: {segmentId: {_eq: $segmentId}, version: {_eq: $version}}, _set: {content: $content}) {
    returning {
      content
    }
  }
}
`

export const createNewVersionWithSegmentIdAndVersion = gql`
mutation createNewVersionWithSegmentIdAndVersion($segmentId: Int!, $version: Int!) {
  insert_SegmentVersion(objects: {segmentId: $segmentId, version: $version, content: "Please select this version to modify the content"}) {
    returning {
      id
    }
  }
}
`

export const getActiveSegmentsForReview = gql`
query getActiveSegmentsForReview($subjectCode:Int!) {
  Segment(where: {status: {_eq: 1}, Subject: {_eq: $subjectCode}}) {
    id
    name
    userId
    currentVersion
    Subject
    history(order_by: {version: asc}) {
      version
      id
      content
    }
  }
}
`

export const getSegmentVersionByVersionAndSegmentId = gql`
query getSegmentVersionByVersionAndSegmentId($version: Int!, $segmentId: Int!) {
  SegmentVersion(where: {segmentId: {_eq: $segmentId}, version: {_eq: $version}}) {
    content
    version
    id
  }
}
`
