import { trpc } from '@/core/appTrpc'
import { Button, Input, Modal, ModalContent, ModalOverlay, VStack } from '@chakra-ui/react'
import React, { useState } from 'react'

const NewPlaylistModal = ({ isOpen, onClose, refreshPlaylists }: { isOpen: boolean, onClose: () => void, refreshPlaylists: () => void }) => {
    const [newPlaylistInput, setNewPlaylistInput] = useState("")
    const [createLoading, setCreateLoading] = useState(false)

    const { mutateAsync: createNewPlaylist } = trpc.newPlaylist.useMutation({})

    const createNewPlaylistSubmitted = async () => {
        if (newPlaylistInput.trim().length <= 0) return
        setCreateLoading(true)
        try {
            await createNewPlaylist({ playlistName: newPlaylistInput })
            refreshPlaylists()
            onClose()
            setNewPlaylistInput("")
        } catch (e) { }

        setCreateLoading(false)
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent mx="2">
                <VStack mx="4" my="4" spacing="4">
                    <Input placeholder="Name your new playlist" variant="flushed" value={newPlaylistInput}
                        onChange={(e) => { setNewPlaylistInput(e.target.value) }}
                        onKeyDown={(e) => { if (e.key == "Enter") { createNewPlaylistSubmitted() } }}
                    />
                    <Button w="100%" isLoading={createLoading} bg="cyan.400" _hover={{ bg: "cyan-400" }} onClick={createNewPlaylistSubmitted}>Create</Button>
                </VStack>
            </ModalContent>
        </Modal >
    )
}

export default NewPlaylistModal