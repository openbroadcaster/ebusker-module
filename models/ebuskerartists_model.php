<?

class EbuskerArtistsModel extends OBFModel
{

	public function latestTransaction($artist_id)
	{
		$this->db->limit(1);
		$this->db->orderby('id','desc');
		$this->db->where('artist_id',$artist_id);
		return $this->db->get_one('ebusker_artists_transactions');
	}

	public function mediaIdToArtist($media_id)
	{

		$this->db->what('ebusker_artists.*');
		$this->db->where('ebusker_artists_media.media_id',$media_id);
		$this->db->leftjoin('ebusker_artists','ebusker_artists_media.artist_id','ebusker_artists.id');

		$artist = $this->db->get_one('ebusker_artists_media');

		return $artist;

	}

}
