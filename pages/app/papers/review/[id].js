import React, { useState, useEffect } from 'react'
import { Box, Text } from 'rebass'
import { withAuth, withLoginRequired, useAuth } from 'use-auth0-hooks'
import { useQuery, useMutation } from 'urql'
import { useRouter } from 'next/router'

import Divider from '../../../../components/divider'
import Container from '../../../../components/container'
import SegmentCardAll from '../../../../components/segment_card_all'
import SegmentCardPaper from '../../../../components/segment_card_paper'

import { addSegmentToPaper, removeSegmentToPaper, getSelectedSegmentsAndAllSegments} from '../../../../pages/queries.js'

import AppHeader from '../../../../components/app_header'


const EditSegment = () => {
  /*
  * useRouter() provides us access to a parameter in the URL of the browser.
  * In this case, the parameter is the database ID of the paper currently
  * being reviewed. We get it by calling router.query.id.
  * 
  * We use this ID later in a database query to get details about this paper.
  */
  const router = useRouter();

  /*
  * We create a new local state variable called "segments" with its setter function, setSegments(),
  * initialized to a list with one element. The element is an object serving as a placeholder to
  * indicate to the user the app is still loading.
  * 
  * We are going to use this "segments" variable to store segments are available for the user
  * to add to the paper.
  */
  const [segments, setSegments] = useState([{name: '...', key: 1, id: 1, currentVersion: 1}]);

  /*
  * Another variable called "selected" is create, initialized as a list with a placeholder of element
  * indicating to the user to add segments to their paper.
  * 
  * We use this variable to store the segments that have been added to the user's paper.
  */
  const [selected, setSelected] = useState([{name: 'Click on the left to add Segments', key: 1, id: 1, currentVersion: 1}]);
  
  /*
  * This method provides us with the details of the user logged in.
  * Currently, calls to useAuth() only provide us the email address of the
  * user logged in, which we access via auth.user.email.
  * 
  * We will use this email address to query our database for Segments
  * authored by the user.
  */
  const auth = useAuth({});

  /*
  * This query gets all segments and all of the segments in this paper. Once it returns,
  * we take the difference of the two lists to determine which ones are not yet in
  * the paper.
  * 
  * Once this query is executed, the value of getSelectedAndAllSegmentsResult will
  * be updated multiple times as the client awaits a result from the database. Once the
  * result is ready, the variable's fetching property will be set to false.
  * 
  * Because of the fact that this result updates multiple times as soon as the page
  * loads, updating the state of the app (and in turn the UI) causes major performance
  * problems (too many redraws). The multiple redraws happen because of this:
  * 
  * 1. The query is executed when the page loads.
  * 2. The query finishes, and we set the new state(s) of the app (see above).
  * 2. This causes the UI to redraw again.
  * 3. The query is executed again when the page loads.
  * 4. .... and again, and again, and again.
  * 
  * To solve this, we use the useEffect() hook which
  * will call a method to perform a state modification only after the getSelectedAndAllSegmentsResult
  * has changed. It works a bit like this:
  * 
  * Iteration   Status of the query   Update the UI?
  * 1           fetching              Yes
  * 2           fetching              No
  * 3           fetching              No
  * 4           Done                  Yes
  */
  const [getSelectedAndAllSegmentsResult] = useQuery({
    query: getSelectedSegmentsAndAllSegments,
    variables: {email: auth.user.email, paperId: router.query.id}
  })

  /*
  * Here we are going to call the arrow function when the above query (getSelectedAndAllSegmentsResult)
  * returns, and the contents are different than the last result of the query.
  * 
  * 1.  The segments that are already in the paper (selectedSegments) are saved to the state
  * which then appear in the UI on the right hand side. If there are no segments in the paper,
  * we leave some directions for the user
  * 
  * 2.  To create the list of available segments, we take a list of all the user's segments,
  * and remove the segments which are already in this paper. This creates the "availableSegments"
  * list. 
  * 
  * The query above, getSelectedSegmentsAndAllSegments, actually has two requests in it. It requests
  * the segments that are in this paper authored by the logged in user, and all the segments in general
  * authored by the user. In order to know if a segment is NOT in the paper, we need to know which ones
  * already are in the paper. It is better to get all of this information in one query instead of two
  * seperate asynchronous queries.
  */
  useEffect(
    () => {
      console.log(getSelectedAndAllSegmentsResult)
      if(!getSelectedAndAllSegmentsResult.fetching && getSelectedAndAllSegmentsResult.data) {
        if(getSelectedAndAllSegmentsResult.data.selectedSegments.length) {
          setSelected(getSelectedAndAllSegmentsResult.data.selectedSegments)
        } else {
          setSelected([{name: 'Click on the left to add Segments', id: 1, currentVersion: 1}])
        }
        if(getSelectedAndAllSegmentsResult.data.allSegments.length) {
          const segmentsInPaper   = getSelectedAndAllSegmentsResult.data.selectedSegments.map(s => s.id)
          const availableSegments = getSelectedAndAllSegmentsResult.data.allSegments.filter(s => segmentsInPaper.indexOf(s.id) === -1)
          setSegments(availableSegments)
        }
      }
    }, [getSelectedAndAllSegmentsResult]
  )

  /*
  * The method called useMutation lets us make modifications to the database.
  * The useMutation function takes in the definition of database changed (called a mutation).
  * It provides us a function which we can call later, providing it variables, to make the
  * database record change.
  */
  const [, executeAddSegment] = useMutation(addSegmentToPaper)
  const [, executeRemoveSegment] = useMutation(removeSegmentToPaper)

  /*
  * These two methods are called when the user clicks to add segments or remove segments from a paper.
  * We could make changes in the local state to reflect adding/removing segments, however
  * the above useEffect() method will be activitied after the database record is updated.
  * Thats where the state modification takes place.
  * 
  * If we update the local state here, we would have to make sure it never gets out of sync
  * with the results from useEffect().
  */
  const toggleOff = (id) => {
    executeRemoveSegment({ segmentId: id, paperId: router.query.id })
  }

  const toggleOn = (id) => {
    executeAddSegment({ segmentId: id, paperId: router.query.id })
  }


  return (
    <div>
      <AppHeader header={[{name: 'Dashboard', dest: '/app'}, {name: 'Papers', dest: '/app/papers'}, {name: 'Edit Paper', dest: '/app/papers'}]}/>

      <Container pt={3}>
        <Divider />
      </Container>

      <Container pr={5} pl={5} justifyContent='space-between'>
        <Box p={3} width={0.5}>
          <Text variant='heading' mb={3}>
            All Segments
          </Text>
          <Divider />
          <Box>
            {segments.map((segment) => {
              return (
                <div key={segment.id}>
                  <SegmentCardAll name={segment.name} id={segment.id} version={segment.currentVersion} toggle={toggleOn}  />
                </div>
              )
            })}
          </Box>
        </Box>
        <Box p={3} width={0.5}>
          <Text variant='heading' mb={3}>
            Selected Segments
          </Text>
          <Divider />
          <Box>
          {selected.map((segment) => {
            return (
              <div key={segment.id}>
                <SegmentCardPaper name={segment.name} id={segment.id} version={segment.currentVersion} toggle={toggleOff} />
              </div>
            )
          })}
          </Box>
        </Box>
      </Container>
    </div>
  )
}

export default withLoginRequired(withAuth(EditSegment))
